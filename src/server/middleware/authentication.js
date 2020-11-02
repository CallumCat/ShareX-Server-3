const { getUserFromKey, getUserFromPassword } = require('../../database/index.js');
const { sha256 } = require('../../util/util.js');

async function authentication (req, res, next) {
  let userData;
  if (req.headers.key) {
    // Get userData from key
    userData = await getUserFromKey(req.headers.key);
    if (userData === null) {
      return res.status(401).json({
        error: 'An incorrect key was provided in the headers.',
      });
    }
  } else if (req.headers.username && req.headers.password) {
    // Get userData from username && password
    let password = sha256(req.headers.password);
    userData = await getUserFromPassword(req.headers.username, password);
    if (userData === null) {
      return res.status(401).json({
        error: 'An incorrect username or password was provided in the headers.',
      });
    }
  } else {
    return res.status(401).json({
      error: 'No key nor username or password was provided in the headers.',
    });
  }

  // Make it so you can access userdata everywhere.
  req.userData = userData;

  // Call the function to go to the next one.
  next();
}

module.exports = authentication;
