/*
    The ShareX Server main file.
*/
const config = require('./config.json');
let PORT = config.port || 1234;

// Fancy stuff
require('colors');
const { warn, log, error } = require('./util/logger');
const fs = require('fs');

const express = require('express');

// Require Middleware
const compression = require('compression');
const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60 * 15,
});

const database = require('./mongo/index.js');
database.init();

// Create the server
let app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

// Middleware
if (config.debug) app.use(require('morgan')('dev'));
app.use(compression());
app.use(express.static(`${__dirname}/public/`));
app.use(express.static(`${__dirname}/uploads/`));
app.use(cookieParser());
app.use(limiter);

// Router
require('./routes').setup(app);

// Start server and log
// IPv4
if (config.ipv4)
  app.listen(PORT, 'localhost')
    .on('error', err => error(err))
    .on('close', () => warn('expressjs server running on IPv4 stopped'))
    .on('listening', () => log('expressjs server running on IPv4 and port: '.white + PORT.toString().green));

// IPv6
if (config.ipv6)
  app.listen(PORT, '::1')
    .on('error', err => error(err))
    .on('close', () => warn('expressjs server running on IPv6 stopped'))
    .on('listening', () => log('expressjs server running on IPv6 and port: '.white + PORT.toString().green));

setInterval(() => {
  fs.readdir('./tmp', (err, files) => {
    if (err) throw err;
    if (files.length === 0) return;
    files.forEach(e => {
      fs.stat(`./tmp/${e}`, (err2, stats) => {
        if (err2) throw err2;
        if (stats.mtimeMs > Date.now() + (1000 * 60 * 60))
          fs.unlink(`./tmp/${e}`, err3 => {
            if (err3) throw err3;
            warn('Deleted Temperary File:', e);
          });
      });
    });
  });
}, 1000 * 60 * 60);

// Gotta Catch em all!
process.on('uncaughtException', err => error(err));
