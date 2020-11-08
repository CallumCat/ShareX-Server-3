/*
    The router for getting a file
*/
const { Router } = require('express');
const { resolve } = require('path');
const { existsSync, readFileSync, unlinkSync } = require('fs');

const { delFile, getFile, addFileView } = require('../../mongo/functions');
const { fileGET, fileDELETE } = require('../../util/logger');
const { browserAuth } = require('../middleware/authentication.js');

const { highlightAuto } = require('highlight.js');
const isFileUtf8 = require('is-file-utf8');

const router = Router();

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 4 * 60 * 1000,
  max: 200,
});
router.use(limiter);

router.get('/:name', async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) return res.status(200).render('pages/404.ejs', { user: null, error: 'File Not Found', success: null });

  let fileData = await getFile(fileName);
  if (fileData === null) return res.status(200).render('pages/404.ejs', { user: null, error: 'File Not Found', success: null });

  await addFileView(fileName);

  let filePath = resolve(`${__dirname}/../../../${fileData.path}`);
  if (!existsSync(filePath)) return res.status(200).render('pages/404.ejs', { user: null, error: 'File Not Found', success: null });

  if (!await isFileUtf8(filePath)) return res.sendFile(filePath);

  fileGET(fileName, req.ip);

  let data = readFileSync(filePath, 'utf8');
  let output = highlightAuto(data).value;

  return res.render('pages/md.ejs', { data: output, title: fileData.originalName });
});

router.get('/delete/:name', browserAuth, async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) return res.status(404).redirect('/?error=File does not exist.');

  let fileData = await getFile(fileName);
  if (fileData === null) return res.status(404).redirect('/?error=File does not exist.');

  if (fileData.uploader !== req.userData.id && !req.userData.owner)
    return res.status(401).redirect('/?error=You do not have permissions to do this.');

  let filePath = resolve(`${__dirname}/../../../${fileData.path}`);
  if (!existsSync(filePath))
    return res.status(401).redirect('/?error=File does not exist.');

  delFile(fileName);
  unlinkSync(filePath);

  res.status(200).redirect('/?success=Successfully deleted the file.');

  fileDELETE(fileName, req.userData.key, req.ip);
});

module.exports = router;
