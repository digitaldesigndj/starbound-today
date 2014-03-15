var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var _ = require('underscore');
var request = require('request');
var User = require('../models/User');

exports.getServer = function(req, res) {
  console.log( req.params.id );
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletGet( req.params.id , function (err, droplet) {
      if (err) return err;
      if( _.contains( user.servers, parseInt( req.params.id ) ) ) {
        if( droplet.status === 'active' ) {
          var commandstar = 'http://' + droplet.ip_address + '/server/status';
          if( droplet.id === 1216418 ) {
            commandstar = 'http://' + droplet.ip_address + '/status/server/status';
          }
          request( { url: commandstar, timeout: 500 } , function (error, response, body) {
            if (!error && response.statusCode == 200) {
              res.render('server', {
                title: 'Manage Server ' + droplet.ip_address,
                droplet: droplet,
                user: req.user,
                status: JSON.parse(body)
              });
            }
            else{
              res.render('server', {
                title: 'Manage Server ' + droplet.ip_address,
                droplet: droplet,
                user: req.user,
                status: false
              });
            }
          });
        }
        else{
          res.render('server', {
            title: 'Manage Server ' + droplet.ip_address,
            droplet: droplet,
            user: req.user,
            status: false
          });
        }
      }
      else {
        req.flash('error', { msg: 'Server ' + req.params.id + ' not found' });
        res.redirect('/');
      }
    });
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */



exports.postUpdateServer = function(req, res, next) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    console.log( req.body );
    api.dropletGet( req.body.id, function (err, droplet) {
      user.server_id = droplet.id || '';
      user.server_tokens = req.body.tokens || '';
      user.save(function (err) {
        if (err) return next(err);
        // req.flash('success', { msg: 'Profile information updated.' });
        res.redirect('server');
      });
    });
  });
};

// // Admins only

// exports.postUpdateServer = function(req, res, next) {
//   // Droplet
//   dropletGet(id, function (err, droplet) {
//     if (err) return next(err);
//     console.log( droplet );

//     User.findById(req.user.id, function (err, user) {
//       if (err) return next(err);
//       // user.email = req.body.email || '';
//       // user.profile.name = req.body.name || '';
//       // user.profile.player = req.body.player || '';
//       // user.profile.steam = req.body.steam || '';
//       // user.profile.gender = req.body.gender || '';
//       // user.profile.location = req.body.location || '';
//       // user.profile.website = req.body.website || '';

//       user.server.token = req.body.token || '';
//       user.server.size = req.body.size || '';
//       user.server.host_name = req.body.host_name || '';
//       user.server.ip_address = req.body.ip_address || '';
//       user.server_id = req.body.id || '';
//       user.server.latest_image = req.body.latest_image || '';
//       user.server.parent_image = req.body.parent_image || '';

//       user.save(function (err) {
//         if (err) return next(err);
//         req.flash('success', { msg: 'Profile information updated.' });
//         res.redirect('server');
//       });
//     });
//   });
// };
