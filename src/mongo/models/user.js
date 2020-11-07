const { Schema, model } = require('mongoose');

const UserSchema = Schema({
  key: String,
  name: String,
  password: String,
  owner: Boolean,
  uploads: Number,
  redirects: Number,
  discord: String,
  CreatedAt: String,
  subdomain: String,
  domain: String,
  id: String,
});

module.exports = model('users', UserSchema);
