/*
    The router for creating a short url
*/

const { Router, json } = require('express');

const db = require('../../../database/index');
const { userAPIGET, userAPIPOST, userAPIGETUPLOADS } = require('../../../util/logger.js');
const { createKey, sha256 } = require('../../../util/util.js');

const router = Router();

router.use(json());

const authentication = require('../../middleware/authentication.js');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
});
router.use(limiter);

router.get('/api/user/uploads', authentication, async (req, res) => {
  let files = await db.getAllFiles(req.userData.name);

  userAPIGETUPLOADS(req.userData.name, req.userData.key, req.ip);

  return res.status(200).json(files);
});

router.get('/api/user', authentication, (req, res) => {
  let returnObj = {
    key: req.userData.key,
    name: req.userData.name,
    owner: req.userData.owner,
    uploads: req.userData.uploads,
    redirects: req.userData.redirects,
    discord: req.userData.discord,
    CreatedAt: req.userData.CreatedAt,
    domain: req.userData.domain,
    subdomain: req.userData.subdomain,
  };

  userAPIGET(req.userData.name, req.userData.key, req.ip);

  return res.status(200).json(returnObj);
});

router.post('/api/user', async (req, res) => {
  if (!req.headers.name) {
    return res.status(400).json({
      error: 'No name was provided in the headers.',
    });
  }
  let name = req.headers.name;

  if (!req.headers.password) {
    return res.status(400).json({
      error: 'No password was provided in the headers.',
    });
  }
  let password = sha256(req.headers.password);

  let userData = await db.getUserFromName(name);
  if (userData !== null) {
    return res.status(400).json({
      error: 'A user with that name already exists.',
    });
  }

  let userObject = {
    key: await createKey(),
    name: name,
    password: password,
    owner: false,
    uploads: 0,
    redirects: 0,
    discord: 'none',
    CreatedAt: new Date(),
    subdomain: 'none',
    domain: 'none',
  };

  await db.saveUser(userObject);

  userAPIPOST(req.userData.name, req.userData.key, req.ip);

  return res.status(200).json(userObject);
});

module.exports = router;
