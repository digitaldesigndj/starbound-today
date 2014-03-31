var _ = require('underscore');
var exec = require('child_process').exec;
var World = require('../models/World');
// var secrets = require('../config/secrets');
// var ayah = require('ayah');
// ayah.configure(secrets.ayah.publisherKey, secrets.ayah.scoringKey);

/**
 * GET /world/:coords
 * Profile page.
 */

exports.getWorldInfo = function(req, res) {
  console.log( req.params.coords )
  World.findOne({ 'world_coords': req.params.coords }, function (err, world) {
    if (err) return handleError(err);
    console.log( world );
    res.render('world', {
      title: 'World Management',
      world: world
    });
  });
};

/**
 * POST /account/profile
/**
 * POST /world/update/:coords
 * Update profile information.
 */

exports.postUpdateWorldInfo = function(req, res, next) {
  World.findOne({ 'world_coords': req.params.coords }, function (err, world) {
    if (err) return next(err);
    world.nickname = req.body.nickname || '';
    world.name = req.body.name || '';
    world.description = req.body.description || '';
    world.address = req.body.address || '';
    world.owner = req.body.owner || '';
    world.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'World information updated.' });
      res.redirect('/worlds');
    });
  });
};