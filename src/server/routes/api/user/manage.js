const { Router, json, urlencoded } = require('express');
const { sha256 } = require('../../../../util');
const { getUserFromPassword } = require('../../../../mongo');
const { browserAuth } = require('../../../middleware/authentication');
const router = Router();

router.use(json());
router.use(urlencoded({ extended: false }));

router.post('/', browserAuth, async (req, res) => {
  // TODO
});

module.exports = router;
