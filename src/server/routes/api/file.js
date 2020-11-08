/*
    The router for creating a short url
*/
const { mainURL } = require('../../../../config.json');

const { Router, json } = require('express');

const { getFile } = require('../../../mongo/functions');
const { fileAPIGET } = require('../../../util/logger');
const { auth } = require('../../middleware/authentication.js');

const router = Router();

router.use(json());

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
});
router.use(limiter);

router.get('/:name', auth, async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) return res.status(401).json({
    error: 'No file name was provided.',
  });

  let fileData = await getFile(fileName);
  if (fileData === null) return res.status(404).json({
    error: 'File not found.',
  });

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

module.exports = router;
