const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.clearCookie('authentication');
  return res.redirect('/');
});

module.exports = router;
