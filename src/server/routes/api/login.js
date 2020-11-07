const { Router, json, urlencoded } = require('express');
const { sha256 } = require('../../../util/util');
const { getUserFromPassword } = require('../../../mongo/functions');
const router = Router();

router.use(json());
router.use(urlencoded({ extended: false }));

router.post('/', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password)
    return res.redirect('/login?error=Please use a valid username and password');

  let passwordHash = sha256(password);
  let userData = await getUserFromPassword(username, passwordHash);
  if (!userData) return res.redirect('/login?error=Please use a valid username and password');

  res.cookie('authentication', userData.key, { expire: 360000 + Date.now() });
  return res.redirect(req.query.r || '/dashboard');
});

module.exports = router;
