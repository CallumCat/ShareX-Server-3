/*
    Main and setup file for routers
*/

/*
    Api
*/
const api = {};
api.file = require('./api/file');
api.login = require('./api/login');
api.logout = require('./api/logout');
api.signup = require('./api/signup');
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
  app.use('/api/file', api.file);
  app.use('/api/login', api.login);
  app.use('/api/logout', api.logout);
  app.use('/api/signup', api.signup);
  app.use('/api/upload', api.upload);
  app.use('/api/url', api.url);
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
