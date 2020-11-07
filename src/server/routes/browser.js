const { Router } = require('express');
const { browserAuth } = require('../middleware/authentication');
const { getUserFromKey, getAllFiles } = require('../../mongo/functions');
const router = Router();

router.get('/', async (req, res) => {
  let error = req.query.error;
  let success = req.query.success;
  let userData = await getUserFromKey(req.cookies.authentication);
  return res.status(200).render('pages/home.ejs', {
    error: error, success: success, user: userData,
  });
});

router.get('/login', async (req, res) => {
  let userData = await getUserFromKey(req.cookies.authentication);
  if (userData) return res.redirect('/dashboard');
  return res.status(200).render('pages/login.ejs', {
    user: null, error: req.query.error, success: req.query.success,
  });
});

router.get('/signup', async (req, res) => {
  let userData = await getUserFromKey(req.cookies.authentication);
  if (userData) return res.redirect('/dashboard');
  return res.status(200).render('pages/signup.ejs', {
    error: req.query.error, user: null,
  });
});

router.get('/files', browserAuth, async (req, res) => {
  let p;
  if (req.query.p) p = req.query.p;
  else p = 0;
  let fileData = (await getAllFiles(req.userData.id)).sort(
    (a, b) => new Date(a.UploadedAt) - new Date(b.UploadedAt),
  ).reverse();
  fileData = fileData.slice(p * 100, 100 + (p * 100));
  return res.status(200).render('pages/files.ejs', { user: req.userData, files: fileData, page: p });
});

router.get('/upload', browserAuth, (req, res) => res.status(200).render('pages/upload.ejs', {
  user: req.userData, error: req.query.error, success: req.query.success,
}));

router.get('/dashboard', browserAuth, (req, res) => res.status(200).render('pages/dashboard.ejs', {
  user: req.userData, error: req.query.error, success: req.query.success,
}));

router.get('/home', (req, res) => res.status(200).render('pages/home.ejs', {
  user: req.userData, error: req.query.error, success: req.query.success,
}));

router.get('/*', async (req, res) => res.status(200).render('pages/404.ejs', {
  user: await getUserFromKey(req.cookies.authentication),
}));

module.exports = router;
