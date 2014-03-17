var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var _ = require('underscore');
var request = require('request');
var User = require('../models/User');
var World = require('../models/World');
var exec = require('child_process').exec;

exports.viewWorldSaves = function(req, res, next) {
  console.log( req.params );
  World.findOne({ world_coords: req.params.world_coords }, function(err, world) {
    console.log( world );
    res.render('world_saves', {
      title: 'World Saves',
      world: world
    });
  });
};

exports.saveWorld = function(req, res, next) {
  console.log( req.body.world_coords );
  var new_world = new World({
    email: req.user.email,
    server: req.user.servers[0],
    world_coords: req.body.world_coords,
    saves:[{
      timestamp:Math.round(new Date().getTime() / 1000),
      verified:false
    }]
  });
  api.dropletGet( req.user.servers[0] , function (err, droplet) {
    if (err) return err;
    var timestamp = Math.round(new Date().getTime() / 1000);
    var command = 'scp root@'+droplet.ip_address+':/root/starbound/universe/'+req.body.world_coords+' /var/www/starrydex/public/'+timestamp+'_'+req.body.world_coords;
    new_world.save(function(err) {
      if (err) {
        if (err.code === 11000) {
          World.findOne({ world_coords: req.body.world_coords }, function(err, world) {
            if (err) return next(err);
            console.log( command )
            exec(command, function (error, stdout, stderr) {
              console.log( stdout );
              world.saves.push({
                timestamp:timestamp,
                verified:false
              });
              world.save(function(err) {
                if (err) return next(err);
                req.flash('info', { msg: 'World Saved' });
                return res.redirect('/server/'+req.user.servers[0]+'/world/'+req.body.world_coords);
              });
            });
          });
        }else{
          req.flash('errors', { msg: 'Error: '+err });
          return res.redirect('/server/'+req.user.servers[0]+'/worlds');
        }
      }else{
        exec(command, function (error, stdout, stderr) {
          console.log( stdout );
          new_world.save(function(err) {
            req.flash('success', { msg: 'World Save Record Created' });
            return res.redirect('/server/'+req.user.servers[0]+'/world/'+req.body.world_coords);
          });
        });
      }
    });
  });
};

/**
 * GET /
 * Home page.
 */

exports.viewWorlds = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletGet( req.user.servers[0] , function (err, droplet) {
      if (err) return err;
      if( _.contains( user.servers, parseInt( req.user.servers[0] ) ) ) {
        var commandstar = 'http://' + droplet.ip_address + '/server/worlds';
        if( droplet.id === 1216418 ) {
          commandstar = 'http://' + droplet.ip_address + '/status/server/worlds';
        }
        request( commandstar, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var worlds = _.sortBy(JSON.parse(body), function(o) { return o.numLoads; }).reverse();
            res.render('worlds', {
              title: 'Manage Worlds ' + droplet.ip_address,
              worlds: worlds
            });
          }
        });
      }
    });
  });
};