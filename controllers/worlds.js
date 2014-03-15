var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var _ = require('underscore');
var request = require('request');
var User = require('../models/User');

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
              title: 'Manage Server ' + droplet.ip_address,
              worlds: worlds
            });
          }
        });
      }
    });
  });
};