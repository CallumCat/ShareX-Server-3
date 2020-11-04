/*
    The router for getting a file
*/
const { Router } = require('express');
const { resolve } = require('path');
const { existsSync, unlinkSync } = require('fs');

const router = Router();

const rateLimit = require('express-rate-limit');
const { fileDELETE, urlDELETE } = require('../../util/logger');
const limiter = rateLimit({
  windowMs: 4 * 60 * 1000,
  max: 200,
});
router.use(limiter);

const { browserAuth } = require('../middleware/authentication.js');

const { getURL, delURL, delFile, getFile } = require('../../database');

router.get('/delete/files/:name', browserAuth, async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) return res.status(404).redirect('/?error=File_does_not_exist.');

  let fileData = await getFile(fileName);
  if (fileData === null) return res.status(404).redirect('/?error=File_does_not_exist.');

  if (fileData.uploader !== req.userData.name && !req.userData.owner) return res.status(401).redirect('/?error=You_do_not_have_permissions_to_do_this.');

  let filePath = resolve(`${__dirname}/../../../${fileData.path}`);
  if (!existsSync(filePath)) return res.status(401).redirect('/?error=You_do_not_have_permissions_to_do_this.');

  delFile(fileName);
  unlinkSync(filePath);

  res.status(200).redirect('/?success=Successfully_deleted_the_file.');

  fileDELETE(fileName, req.userData.key, req.ip);
});

router.get('/delete/url/:id', browserAuth, async (req, res) => {
  let urlID = req.params.id;
  if (!urlID) return res.status(404).sendFile(resolve('src/server/public/404/index.html'));

  let urlData = await getURL(urlID);
  if (urlData === null) return res.status(404).sendFile(resolve('src/server/public/404/index.html'));

  if (urlData.uploader !== req.userData.name && !req.userData.owner) return res.status(401).redirect('/?error=You_do_not_have_permissions_to_do_this.');

  delURL(urlID);

  res.status(200).redirect('/?success=Successfully_deleted_the_url_redirect.');

  urlDELETE(urlID, req.userData.key, req.ip);
});

module.exports = router;
