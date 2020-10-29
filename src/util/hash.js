const crypto = require('crypto');

module.exports.md5 = (str) => crypto.createHash('md5').update(str).digest('hex');
module.exports.sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');