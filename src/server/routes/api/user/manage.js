const { Router, json, urlencoded } = require('express');
const { sha256 } = require('../../../../util');
const { getUserFromPassword } = require('../../../../mongo');
const { browserAuth } = require('../../../middleware/authentication');
const router = Router();

router.use(json());
router.use(urlencoded({ extended: false }));

router.post('/', browserAuth, async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let passwordCheck = req.body.password2;
  if (!username || !password)
    return res.redirect('/dashboard?error=Please use a valid username and password');

  let passwordHash = sha256(password);
  let userData = await getUserFromPassword(username, passwordHash);
  if (!userData) return res.redirect('/dashboard?error=Please use a valid username and password');

  return res.redirect(req.query.r || '/dashboard');
});

module.exports = router;
