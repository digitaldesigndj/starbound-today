var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  if( req !== undefined ) {
    if( req.user !== undefined ) {
      if( req.user.server != 0 ) {
        res.redirect('/server/'+req.user.server);
      }else{
        res.render('home',{title: 'Coming Soon' });   
      }
    }else{
      res.render('home',{title: 'Coming Soon' });   
    }
  }
  else {
    res.render( 'home', { title: 'Coming Soon' });
  }
};
