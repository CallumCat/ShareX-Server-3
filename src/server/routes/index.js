/*
    Main and setup file for routers
*/

/*
    Api
*/
const api = {};
api.user = {};
api.user.login = require('./api/user/login');
api.user.signup = require('./api/user/signup');
api.file = require('./api/file');
api.upload = require('./api/upload');
api.url = require('./api/url');

/*
    GET requests
*/
const File = require('./files');
const URL = require('./url');

/*
    Browsers LOL
*/
const browser = require('./browser');

/*
    Created so I wouldnt have a mess in the app.js
*/
let setup = app => {
  // Users
  app.use('/api/user/login', api.user.login);
  app.use('/api/user/signup', api.user.signup);

  // Files/URLs API
  app.use('/api/file', api.file);
  app.use('/api/upload', api.upload);
  app.use('/api/url', api.url);

  // Files/URLs
  app.use('/url', URL);
  app.use('/files', File);

  // Browsers
  app.use('/', browser);

  // 404s
  app.delete('/*', (req, res) => { res.status(200).send('nothing here'); });
  app.post('/*', (req, res) => { res.status(200).send('nothing here'); });
  app.put('/*', (req, res) => { res.status(200).send('nothing here'); });
  app.patch('/*', (req, res) => { res.status(200).send('nothing here'); });
};

module.exports = { setup };
