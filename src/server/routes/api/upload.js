/*
    The router for uploading a file
*/
const { mainURL } = require('../../../../config.json');

const { Router } = require('express');
const { existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');

const { addUserUpload, saveFile, getUserFromKey } = require('../../../mongo');
const { filePOST } = require('../../../util/logger.js');
const { generateRandomString } = require('../../../util');
const fileFunctionMap = require('../../../util/fileFunction.js');

const router = Router();

const { auth } = require('../../middleware/authentication.js');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
});
router.use(limiter);

const fileUpload = require('express-fileupload');
router.use(fileUpload());

const createFileName = (fileExt, loc) => {
  let nFN = `${generateRandomString(15)}.${fileExt}`;
  let fileLocation = `./uploads/${loc}/${nFN}.${fileExt}`;
  if (existsSync(fileLocation)) return createFileName(fileExt, loc);
  return nFN;
};

router.post('/', auth, (req, res) => {
  if (!req.files || !req.files.file) return res.status(400).json({
    error: 'No file was uploaded.',
  });

  saveFileFunction(req.userData, req.files.file, false, req, res);
});

router.post('/browser', async (req, res) => {
  let key = req.body.key;
  if (!key) return res.redirect('/upload?error=An unknown error has occured');

  let userData = await getUserFromKey(key);
  if (!userData) return res.redirect('/upload?error=An unknown error has occured');

  let file = req.files.file;
  if (!file) return res.redirect('/upload?error=An unknown error has occured');

  saveFileFunction(userData, req.files.file, true, req, res);
});

const saveFileFunction = (userData, file, browser, req, res) => {
  let location = userData.id;
  let fileName = file.name.split('.');
  let fileExt = fileName[fileName.length - 1];
  let name = createFileName(fileExt, location);

  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let uploadDir = `uploads/${location}/${year}/${month}/${day}`;

  if (!existsSync(resolve('../../', uploadDir)))
    mkdirSync(resolve('../../', uploadDir), { recursive: true });

  file.mv(resolve('../../', `${uploadDir}/${name}`), async err => {
    if (err) return res.status(500).send(err);

    await saveFile({
      originalName: file.name,
      uploader: userData.id,
      path: `${uploadDir}/${name}`,
      name: name,
      UploadedAt: new Date(),
      views: 0,
    });

    let linkPart = userData.domain === undefined || userData.domain === 'none' ?
      mainURL : userData.subdomain === undefined || userData.subdomain === 'none' ?
        mainURL : `https://${userData.subdomain}.${userData.domain}`;
    let url = `${linkPart}/files/${name}`;

    filePOST(name, req.ip, userData.key);

    res.setHeader('Content-Type', 'application/json');
    if (browser) res.status(200).redirect(`/upload${userData.id == 'public' ? '/public' : ''}?success=${url}`);
    else res.status(200).end(url);

    let fileFunction = fileFunctionMap.get(fileExt);
    if (fileFunction) await fileFunction(uploadDir);

    await addUserUpload(userData.key);
  });
};

module.exports = router;
