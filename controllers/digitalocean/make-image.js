var secrets = require('../../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);

exports.getMakeImage = function (req, res) {
  api.imageGetAll(function (error, images){
    res.render('hosting/make/image', {
      'title': 'Make a new image',
      'images': images
    });
  });
};

exports.postMakeImage = function (req, res) {
  res.send( req );
};