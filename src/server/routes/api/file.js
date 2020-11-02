/*
    The router for creating a short url
*/
const { mainURL } = require('../../../config.json');

const { Router, json } = require('express');
const { resolve } = require('path');
const { unlink } = require('fs');

const { getFile, delFile } = require('../../../database/index');
const { fileAPIGET, fileDELETE } = require('../../../util/logger');

const router = Router();

router.use(json());

const authentication = require('../../middleware/authentication.js');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
});
router.use(limiter);

router.get('/api/file/:name', async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) {
    return res.status(401).json({
      error: 'No file name was provided in the body.',
    });
  }

  let fileData = await getFile(fileName);
  if (fileData === null) {
    return res.status(404).json({
      error: 'File not found.',
    });
  }

  let returnObj = {
    name: fileData.originalName,
    path: fileData.path,
    link: `${mainURL}/files/${fileData.name}`,
    views: fileData.views,
    uploader: fileData.uploader,
    UploadedAt: fileData.UploadedAt,
    lock: fileData.lock.active,
  };

  fileAPIGET(fileData.name, req.ip);

  return res.status(200).json(returnObj);
});

router.delete('/api/file/:name', authentication, async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) {
    return res.status(200).json({
      error: 'File does not exist.',
    });
  }

  let fileData = await getFile(fileName);
  if (fileData === null) {
    return res.status(404).json({
      error: 'File does not exist.',
    });
  }

  if (req.userData.name !== fileData.uploader) {
    return res.status(400).json({
      error: 'An incorrect key was provided.',
    });
  }

  let filePath = resolve(`${__dirname}/../../../${fileData.path}`);
  await delFile(fileData.name);
  unlink(filePath, err => {
    if (err) throw err;
  });

  fileDELETE(fileData.name, req.ip, req.userData.key);

  return res.status(400).json({
    success: true,
    message: 'File was deleted.',
  });
});

module.exports = router;
