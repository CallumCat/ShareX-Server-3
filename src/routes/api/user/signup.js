/*
    The router for user sign up
*/
const { Router, json, urlencoded } = require('express');

const { saveUser } = require('../../../mongo');
const { userAPIPOST } = require('../../../util/logger');
const { sha256, createKey } = require('../../../util');

const router = Router();

router.use(json());
router.use(urlencoded({ extended: false }));

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 25,
});
router.use(limiter);

router.post('/', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let passwordCheck = req.body.confirmPassword;
  if (password !== passwordCheck)
    return res.redirect('/signup?error=Passwords did not match');

  if (!username || !password)
    return res.redirect('/signup?error=Please include a username and password');

  password = sha256(password);

  let userObject = {
    key: await createKey(),
    name: username,
    password: password,
    owner: false,
    uploads: 0,
    redirects: 0,
    discord: 'none',
    id: Math.floor(Math.random() * 10000000),
    CreatedAt: new Date(),
    subdomain: 'none',
    domain: 'none',
  };

  let userData = await saveUser(userObject);

  userAPIPOST(userData.name, userData.key, req.ip);

  res.cookie('authentication', userData.key, { expire: 360000 + Date.now() });
  return res.redirect('/home');
});

module.exports = router;
