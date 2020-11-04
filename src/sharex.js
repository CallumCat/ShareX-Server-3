const app = require('./server/app');
app.start();

const database = require('./database/index');
database.init();

const discord = require('./discord/index');
discord.startBot();

console.log(require('./util/logo/index'));

const fs = require('fs');
if (!fs.existsSync('./uploads/')) fs.mkdirSync('./uploads/');
