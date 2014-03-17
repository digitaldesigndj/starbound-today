var mongoose = require('mongoose');

var worldSchema = new mongoose.Schema({
  world_coords: { type: String, unique: true },
  email: { type: String, lowercase: true },
  server: Number,
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  saves: Array
});

module.exports = mongoose.model('World', worldSchema);
