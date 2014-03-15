var secrets = require('../../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);

exports.getIndex = function (req, res) {
  // Get things done
  api.dropletGetAll(function (error, data){
    res.render('hosting/index', {
      'title': 'Server Admin',
      'droplets': data
    });
  });
};

exports.getServers = function (req, res) {
  // Get things done
  api.dropletGetAll(function (error, data){
    res.render('hosting/servers', {
      'title': 'Servers',
      'droplets': data
    });
  });
};

exports.getImages = function (req, res) {
  // Get things done
  api.imageGetAll(function (error, images){
    res.render('hosting/images', {
      'title': 'Server Images',
      'images': images
    });
  });
};

exports.getDomains = function (req, res) {
  // Get things done
  api.domainGetAll(function(error, data){
    res.render('hosting/domains', {
      'title': 'Domains',
      'domains': data
    });
  });
};
