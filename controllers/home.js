var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  // if( req.user !== undefined ) {
  //   res.redirect('/server/'+req.user.servers[0]);
  // }
  // else {
    res.render('home',{title: 'Coming Soon' });
  // }
};
