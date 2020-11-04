/*
    The router for uploading a file
*/
const { mainURL, maxFileSize } = require('../../../config.json');

const { Router } = require('express');
const { existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');

const { addUserUpload, saveFile } = require('../../../database/index');
const { filePOST } = require('../../../util/logger');
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
router.use(fileUpload({
  safeFileNames: true,
  preserveExtension: 7,
  useTempFiles: true,
  tempFileDir: resolve(`${__dirname}../../../temp/`),
  limits: {
    fileSize: maxFileSize || 9007199254740991,
  },
}));

const createFileName = (fileExt, loc) => {
  let nFN = `${generateRandomString(15)}.${fileExt}`;
  let fileLocation = `./uploads/${loc}/${nFN}.${fileExt}`;
  if (existsSync(fileLocation)) return createFileName(fileExt, loc);
  return nFN;
};

router.post('/api/upload', auth, (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({
      error: 'No file was uploaded.',
    });
  }

  let location = req.userData.name;
  let fileName = req.files.file.name.split('.');
  let fileExt = fileName[fileName.length - 1];
  let name = createFileName(fileExt, location);

  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let uploadPath = `uploads/${location}/${year}/${month}/${day}/${name}`;

  if (!existsSync(`./uploads/${location}/${year}/${month}/${day}`)) mkdirSync(`./uploads/${location}/${year}/${month}/${day}`, { recursive: true });

  req.files.file.mv(uploadPath, async err => {
    if (err) return res.status(500).send(err);

    let lockActive = req.body.locked || false;
    let lockPassword = req.body.password || 'none';

    await saveFile({
      originalName: req.files.file.name,
      uploader: location,
      path: uploadPath,
      name: name,
      UploadedAt: new Date(),
      views: 0,
      lock: {
        active: lockActive,
        password: lockPassword,
      },
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

module.exports = router;
