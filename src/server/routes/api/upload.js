/*
    The router for uploading a file
*/
const { mainURL } = require('../../../../config.json');

const { Router } = require('express');
const { existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');

const { addUserUpload, saveFile, getUserFromKey } = require('../../../mongo/functions');
const { filePOST } = require('../../../util/logger.js');
const { generateRandomString } = require('../../../util/util');
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

  let location = req.userData.id;
  let fileName = req.files.file.name.split('.');
  let fileExt = fileName[fileName.length - 1];
  let name = createFileName(fileExt, location);

  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let uploadPath = `uploads/${location}/${year}/${month}/${day}/${name}`;

  if (!existsSync(`./uploads/${location}/${year}/${month}/${day}`))
    mkdirSync(`./uploads/${location}/${year}/${month}/${day}`, { recursive: true });

  req.files.file.mv(resolve('../../', uploadPath), async err => {
    if (err) return res.status(500).send(err);

    // let lockActive = req.body.locked || false;
    // let lockPassword = req.body.password || 'none';

    await saveFile({
      originalName: req.files.file.name,
      uploader: location,
      path: uploadPath,
      name: name,
      UploadedAt: new Date(),
      views: 0,
      // lock: {
      //   active: lockActive,
      //   password: lockPassword,
      // },
    });

    let linkPart = req.userData.domain === undefined || req.userData.domain === 'none' ?
      mainURL : req.userData.subdomain === undefined || req.userData.subdomain === 'none' ?
        mainURL : `https://${req.userData.subdomain}.${req.userData.domain}`;
    let url = `${linkPart}/files/${name}`;

    filePOST(name, req.ip, req.userData.key);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(url);

    let fileFunction = fileFunctionMap.get(fileExt);
    if (fileFunction) await fileFunction(uploadPath);

    await addUserUpload(req.userData.key);
  });
});

router.post('/browser', async (req, res) => {
  let key = req.body.key;
  if (!key) return res.redirect('/upload?error=An unknown error has occured');

  let userData = await getUserFromKey(key);
  if (!userData) return res.redirect('/upload?error=An unknown error has occured');

  let file = req.files.file;
  if (!file) return res.redirect('/upload?error=An unknown error has occured');

  let location = userData.id;
  let fileName = req.files.file.name.split('.');
  let fileExt = fileName[fileName.length - 1];
  let name = createFileName(fileExt, location);

  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let uploadPath = `uploads/${location}/${year}/${month}/${day}/${name}`;

  if (!existsSync(`../../uploads/${location}/${year}/${month}/${day}`))
    mkdirSync(`../../uploads/${location}/${year}/${month}/${day}`, { recursive: true });

  req.files.file.mv(resolve('../../', uploadPath), async err => {
    if (err) return res.status(500).send(err);

    // let lockActive = req.body.locked || false;
    // let lockPassword = req.body.password || 'none';

    await saveFile({
      originalName: req.files.file.name,
      uploader: userData.id,
      path: uploadPath,
      name: name,
      UploadedAt: new Date(),
      views: 0,
      // lock: {
      //   active: lockActive,
      //   password: lockPassword,
      // },
    });

    let linkPart = userData.domain === undefined || userData.domain === 'none' ?
      mainURL : userData.subdomain === undefined || userData.subdomain === 'none' ?
        mainURL : `https://${userData.subdomain}.${userData.domain}`;
    let url = `${linkPart}/files/${name}`;

    filePOST(name, req.ip, userData.key);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).redirect(`/upload?success=${url}`);

    let fileFunction = fileFunctionMap.get(fileExt);
    if (fileFunction) await fileFunction(uploadPath);

    await addUserUpload(userData.key);
  });
});

module.exports = router;
