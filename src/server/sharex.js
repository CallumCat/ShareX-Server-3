/*
    The ShareX Server main file.
*/
const config = require('../../config.json');
let PORT = config.port || 1234;

// Fancy stuff
require('colors');

const express = require('express');

// Require Middleware
const compression = require('compression');
const cookieParser = require('cookie-parser');

const database = require('../mongo/functions.js');
database.init();

console.log(require('../util/logo/index.js'));

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

// Router
require('./routes').setup(app);

// Start server and log
app.listen(PORT, () => {
  console.log('ExpressJS server running on port: '.green + PORT.toString().white);
});
