var secrets = require('../config/secrets');
var dropletUtils = require('../droplet_utils')
var User = require('../models/User');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var _ = require('underscore');
var request = require('request');

exports.addtokens = function(req, res) {
  console.log( req.params.tokens );
  User.findById(req.user.id, function (err, user) {
    if (err) return err;
    if( (((user.server_tokens-user.used_tokens)-user.current_server_used_tokens)-req.params.tokens) > 0 ) {
      user.current_server_used_tokens = +user.current_server_used_tokens + +req.params.tokens
      req.flash('success', { msg: req.params.tokens + ' Tokens Added' });
    }
    else {
      req.flash('errors', { msg: 'You don\'t have ' + req.params.tokens + ' tokens to add.' });
    }
    user.save(function (err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });
};

exports.getServer = function(req, res) {
  console.log( req.params.id );
  User.findById(req.user.id, function (err, user) {
    if (err) return err;
    if ( user.server != 0 ){
      api.dropletGet( user.server , function (err, droplet) {
        if (err) return err;
        if( user.server != 0 ) {
          if( droplet.status === 'active' ) {
            var commandstar = 'http://' + droplet.ip_address + '/server/status';
            request( { url: commandstar, timeout: 500 } , function (error, response, body) {
              if (!error && response.statusCode == 200) {
                res.render('server', {
                  title: 'Manage Server ' + droplet.ip_address,
                  droplet: droplet,
                  user: user,
                  status: JSON.parse(body),
                  stats: dropletUtils.getDropletStats(user,droplet)
                });
              }
              else {
                res.render('server', {
                  title: 'Manage Server ' + droplet.ip_address,
                  droplet: droplet,
                  user: user,
                  status: false,
                  stats: dropletUtils.getDropletStats(user,droplet)
                });
              }
            });
          }
          else {
            res.render('server', {
              title: 'Manage Server ' + droplet.ip_address,
              droplet: droplet,
              user: user,
              status: false
            });
          }
        }
        else {
          req.flash('error', { msg: 'Server ' + req.params.id + ' not found' });
          res.redirect('/');
        }
      });
    }
    else {
      res.redirect('/');
    }
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
    api.dropletGet( user.server, function (err, droplet) {
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
//       // user.name = req.body.name || '';
//       // user.player = req.body.player || '';
//       // user.steam = req.body.steam || '';
//       // user.gender = req.body.gender || '';
//       // user.location = req.body.location || '';
//       // user.website = req.body.website || '';

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
