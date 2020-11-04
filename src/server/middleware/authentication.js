const { getUserFromKey, getUserFromPassword } = require('../../database/index.js');
const { sha256 } = require('../../util/util.js');

const incorrectKey = { error: 'An incorrect key was provided in the headers.' };
const incorrectPass = { error: 'An incorrect username or password was provided in the headers.' };
const noKeyorPass = { error: 'No key nor username or password was provided in the headers.' };

async function authentication (req, res, next) {
  let userData;
  if (req.headers.key) {
    // Get userData from key
    userData = await getUserFromKey(req.headers.key);
    if (userData === null) {
      return res.status(401).json(incorrectKey);
    }
  } else if (req.headers.username && req.headers.password) {
    // Get userData from username && password
    let password = sha256(req.headers.password);
    userData = await getUserFromPassword(req.headers.username, password);
    if (userData === null) {
      return res.status(401).json(incorrectPass);
    }
  } else {
    return res.status(401).json(noKeyorPass);
  }

  // Make it so you can access userdata everywhere.
  req.userData = userData;

  // Call the function to go to the next one.
  next();
}

async function browserAuthentication (req, res, next) {
  let userData;
  if (req.query.key) {
    // Get userData from key
    userData = await getUserFromKey(req.query.key);
    if (userData === null) {
      return res.status(401).redirect(`/?error=An_incorrect_key_was_provided.`);
    }
  } else if (req.query.username && req.query.password) {
    // Get userData from username && password
    let password = sha256(req.query.password);
    userData = await getUserFromPassword(req.query.username, password);
    if (userData === null) {
      return res.status(401).redirect(`/?error=An_incorrect_username_or_password_was_provided.`);
    }
  } else {
    return res.status(401).redirect(`/?error=No_key_or_username_and_password_was_provided`);
  }

  // Make it so you can access userdata everywhere.
  req.userData = userData;
  req.token = userData.token;

  // Call the function to go to the next one.
  next();
}

module.exports.auth = authentication;
module.exports.browserAuth = browserAuthentication;
