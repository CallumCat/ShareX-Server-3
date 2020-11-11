/*
    The router for creating a short url
*/
const { mainURL } = require('../../config.json');

const { Router, json, urlencoded } = require('express');

const { saveURL, getURL } = require('../../mongo');
const { urlAPIGET, urlPOST } = require('../../util/logger');
const { generateRandomString } = require('../../util');
const { auth } = require('../../middleware/authentication.js');

const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
});
router.use(limiter);

const CreateUrl = async length => {
  length = parseInt(length);
  let number = generateRandomString(10);
  let urlTest = await getURL(number);
  if (urlTest) return CreateUrl(length);
  return number;
};

router.get('/:id', auth, async (req, res) => {
  let urlID = req.params.id;
  if (!urlID) return res.status(400).json({
    error: 'No URL ID provided.',
  });

  let urlData = await getURL(urlID);
  if (urlData === null) return res.status(400).json({
    error: 'URL not found.',
  });

  if (urlData.uploader !== req.userData.name && req.userData.owner !== true) return res.status(401).json({
    error: 'You do not have access.',
  });

  let returnObj = {
    id: urlData.id,
    link: `${mainURL}/url/${urlData.id}`,
    views: urlData.views,
    uploader: urlData.uploader,
    redirect: urlData.redirect,
    CreatedAt: urlData.CreatedAt,
  };

  urlAPIGET(urlData.id, req.ip);

  return res.status(200).json(returnObj);
});

router.post('/', auth, async (req, res) => {
  let url = req.body.url;
  if (!url) return res.status(400).json({
    error: 'No url provided.',
  });

  let redirectNum = await CreateUrl(10);

  await saveURL({
    id: redirectNum,
    views: 0,
    uploader: req.userData.name,
    redirect: url,
    CreatedAt: new Date(),
  });

  let urlPart = req.userData.domain === undefined || req.userData.domain === 'none' ?
    mainURL : req.userData.subdomain === undefined || req.userData.subdomain === 'none' ?
      mainURL : `https://${req.userData.subdomain}.${req.userData.domain}`;

  urlPOST(url, req.ip, req.userData.key);

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).end(`${urlPart}/url/${redirectNum}`);
});

module.exports = router;
