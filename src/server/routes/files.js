/*
    The router for getting a file
*/
const { Router } = require('express');
const { resolve } = require('path');
const { existsSync, readFileSync } = require('fs');

const { getFile, addFileView } = require('../../database/index');
const { fileGET } = require('../../util/logger');
const mdFile = require('../../util/md.js');

const { highlightAuto } = require('highlight.js');
const isFileUtf8 = require('is-file-utf8');

const router = Router();

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 4 * 60 * 1000,
  max: 200,
});
router.use(limiter);

router.get('/files/:name', async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) return res.status(302).redirect('/404');

  let fileData = await getFile(fileName);
  if (fileData === null) return res.status(302).redirect('/404');

  await addFileView(fileName);

  let filePath = resolve(`${__dirname}/../../../${fileData.path}`);
  if (!existsSync(filePath)) return res.status(302).redirect('/404');

  fileGET(fileName, req.ip);

  return res.sendFile(filePath);
});

router.get('/md/:name', async (req, res) => {
  let fileName = req.params.name;
  if (!fileName) return res.status(302).redirect('/404');

  let fileData = await getFile(fileName);
  if (fileData === null) return res.status(302).redirect('/404');

  await addFileView(fileName);

  let filePath = resolve(`${__dirname}/../../../${fileData.path}`);
  if (!existsSync(filePath)) return res.status(302).redirect('/404');

  if (!await isFileUtf8(filePath)) return res.sendFile(filePath);

  fileGET(fileName, req.ip);

  let data = readFileSync(filePath, 'utf8');
  let output = highlightAuto(data).value;
  output = mdFile(output, fileData.originalName);

  return res.send(output);
});

module.exports = router;
