/*
    The router for deleting a file
*/
const { unlink } = require('fs');
const { Router } = require('express');
const { resolve } = require('path');

const { getFile, delFile } = require('../../../database/index.js');
const { fileDELETE } = require('../../../util/logger.js');

const router = Router();

const authentication = require('../../middleware/authentication.js');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 75,
});
router.use(limiter);

router.delete('/api/delete/:name', authentication, async (req, res) => {
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
