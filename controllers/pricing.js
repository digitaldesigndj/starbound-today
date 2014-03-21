var secrets = require('../config/secrets');
var transients = require('../transients');

var price_url = 'https://api.digitalocean.com/sizes/?client_id='
    +secrets.digitalocean.client_id
    +'&api_key='
    +secrets.digitalocean.api_key;

/**
 * GET /arcade, /monthly, /pricing
 * Pricing Page
 */

transients.setTransient( 'sizes', price_url, 3600 );

exports.getArcadePricing = function(req, res) {
  transients.getTransient( 'sizes', function( data ) {
    res.render('pricing', {
      title: 'Arcade Pricing',
      sizes: data.sizes
    });
  });
};