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

exports.viewPlayers = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletGet( req.user.server , function (err, droplet) {
      if (err) return err;
      if( user.server == parseInt( req.user.server ) ) {
        var commandstar = 'http://' + droplet.ip_address + '/server/players';
        request( commandstar, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var players = _.sortBy(JSON.parse(body), function(o) { return o.numLogins; }).reverse();
            res.render('players', {
              title: 'Manage Players ' + droplet.ip_address,
              players: players
            });
          }
        });
      }
    });
  });
};