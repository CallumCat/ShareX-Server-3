/*
    The ShareX Server main file.
*/
const config = require('../config.json');
let PORT = config.port || 1234;

// Fancy colors
const colors = require('colors');

const express = require('express');

// Require Middleware
const compression = require('compression');

module.exports.start = () => {
    // Create the server
    let app = express();
    app.disable('x-powered-by');
    app.set('trust proxy', true);

    // Middleware
    if (config.debug) app.use(require('morgan')('dev'));
    app.use(compression());
    app.use(express.static(__dirname + '/public/'));
    app.use(express.static(__dirname + '/uploads/'));

    // Router
    require('./routes').setup(app);

    // 404 message
    app.get('/*', (req, res) => { return res.status(302).redirect('/404'); });

    // Start server and log
    app.listen(PORT, () => {
        console.log('Starting ShareX Server on port: '.green + PORT.toString().white);
    });
};