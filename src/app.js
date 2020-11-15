/*
    The ShareX Server main file.
*/
const config = require('./config.json');
let PORT = config.port || 1234;

// Fancy stuff
require('colors');
const { warn, log } = require('./util/logger');
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
app.listen(PORT, () => {
  console.log('ExpressJS server running on port: '.green + PORT.toString().white);
});

setInterval(() => {
  fs.readdir('./tmp', (err, files) => {
    if (err) throw err;
    if (files.length === 0) return;
    log('Attempting to Delete', files.length, `Temperary file${files.length > 1 ? 's' : ''}. Currently:`, new Date().toLocaleString());
    files.forEach(e => {
      fs.stat(`./tmp/${e}`, (err2, stats) => {
        if (err2) throw err2;
        if (stats.mtimeMs > Date.now() + 1000 * 60 * 60)
          fs.unlink(`./tmp/${e}`, err3 => {
            if (err3) throw err3;
            warn('Deleted Temperary File:', e);
          });
      });
    });
  });
}, 1000 * 60 * 60);
