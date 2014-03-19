var mongoose = require('mongoose');

var worldSchema = new mongoose.Schema({
  world_coords: { type: String, unique: true },
  email: { type: String, lowercase: true },
  server: Number,
  ip_address: { type: String, default: '' },
  nickname: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  owner: { type: String, default: '' },
  system: { type: String, default: '' },
  saves: Array
});

module.exports = mongoose.model('World', worldSchema);
