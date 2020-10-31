/*
    The router for uploading a file
*/
const { mainURL, maxFileSize } = require('../../../config.json');

const { Router } = require('express');
const { existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');

const { getUserFromKey, addUserUpload, saveFile, getUserFromPassword } = require('../../../database/index');
const { filePOST } = require('../../../util/logger');
const { sha256 } = require('../../../util/hash');
const fileFunctionMap = require('../../../util/fileFunction.js');

const router = Router();

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
  let nFN = `${Math.floor(Math.random() * 9007199254740991).toString(36)}.${fileExt}`;
  let fileLocation = `./uploads/${loc}/${nFN}.${fileExt}`;
  if (existsSync(fileLocation)) return createFileName(fileExt, loc);
  return nFN;
};

router.post('/api/upload', async (req, res) => {
  let userData;
  if (req.headers.key) {
    userData = await getUserFromKey(req.headers.key);
    if (userData === null) {
      return res.status(401).json({
        error: 'An incorrect key was provided in the headers.',
      });
    }
  } else if (req.headers.username && req.headers.password) {
    let password = sha256(req.headers.password);
    userData = await getUserFromPassword(req.headers.username, password);
    if (userData === null) {
      return res.status(401).json({
        error: 'An incorrect username or password was provided in the headers.',
      });
    }
  } else {
    return res.status(401).json({
      error: 'No key nor username or password was provided in the headers.',
    });
  }

  if (!req.files || !req.files.file) {
    return res.status(400).json({
      error: 'No file was uploaded.',
    });
  }

  let location = userData.name;
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

    let linkPart = userData.domain === undefined || userData.domain === 'none' ?
      mainURL : userData.subdomain === undefined || userData.subdomain === 'none' ?
        mainURL : `https://${userData.subdomain}.${userData.domain}`;
    let url = `${linkPart}/files/${name}`;

    filePOST(name, req.ip, userData.key);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(url);

    let fileFunction = fileFunctionMap.get(fileExt);
    if (fileFunction) await fileFunction(uploadPath);

    await addUserUpload(userData.key);
  });
});

module.exports = router;
