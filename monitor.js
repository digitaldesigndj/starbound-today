var secrets = require('./config/secrets');
var getDropletStats = require('./droplet_stats');
var User = require('./models/User');

var mongoose = require('mongoose');
mongoose.connect(secrets.db);

var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);

var fs = require('fs');
var _ = require('underscore');

var checkServers = function () {
  console.log( '| Doing Server Check' );
  User.find( '', function(err,users) {
    if (err) return err;
    var starbound_servers = [];
    _.each(users, function(user,i) {
      // console.log(user);
      if( user.servers[0] != undefined ) {
        starbound_servers.push( user.servers[0] );
      }
      return false;
    });
    console.log( '| Servers' );

    api.dropletGetAll(function(err,droplets){
      if (err) return err;
      _.each(droplets, function(droplet,i) {
        if( _.contains( starbound_servers, droplet.id ) ) {          
          console.log( droplet.name, droplet.id );
          // starbound.today Droplets
          var data = getDropletStats( droplet );
          data.name = droplet.name;
          data.id = droplet.id;
          data.time = new Date();
          fs.appendFile('./server-monitor.log', data, function (err) {
            console.log( 'Ran 15 min check' );
          });
        }
      });
    });

  });
}

setInterval( checkServers(), 15 * 60 * 1000 );
