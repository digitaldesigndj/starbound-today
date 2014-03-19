var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var inviteSchema = new mongoose.Schema({
  // email: { type: String, unique: true },

  url_hash: { type: String, default: '', unique: true },

  source: { type: String, default: '' },
  claimed: { type: Boolean, default: false },
  test: { type: Boolean, default: false },
  email: { type: String, default: '' },

});

module.exports = mongoose.model('Invite', inviteSchema);
