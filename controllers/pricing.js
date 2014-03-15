var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var request = require('request');
var _ = require('underscore');
/**
 * GET /
 * Home page.
 */

exports.getPricing = function(req, res) {
  var url = 'https://api.digitalocean.com/sizes/?client_id='
    +secrets.digitalocean.client_id
    +'&api_key='
    +secrets.digitalocean.api_key;
  request( url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log( body );
      res.render('pricing', {
        title: 'Fair Pricing',
        sizes: JSON.parse(body).sizes
      });
    }
  });
};