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
  User.find(  { server: { $gt: 1 } }, function(err,users) {
    if (err) return err;
    _.each( users, function( user ) {
      api.dropletGet( user.server, function ( err, droplet ) {
        if (err) return err;
        console.log( droplet.name, droplet.id, user.server_tokens);
        var data = getDropletStats( droplet );
        data.current = Math.round(100*(user.server_tokens-data.tokens))/100;;
        data.name = droplet.name;
        data.id = droplet.id;
        data.time = new Date();
        console.log( data );
        if( data.current < 0 ) {
          // Save a billing entry here -- and delete in manage-server js too...
          var created_time = new Date(droplet.created_at).getTime()/1000;
          var current_time = new Date().getTime()/1000;
          var server_lifetime =  current_time - created_time;
          console.log( 'Server Destroyed' );
          console.log( created_time, current_time, server_lifetime );
          user.destoryed_servers.push(user.server);
          user.billed_seconds = +user.billed_seconds + server_lifetime;
          user.server = 0;
          console.log( 'Destroying a droplet' );
          api.dropletDestroy( droplet.id, function ( err, event ) {
            user.save( function(err) {
              if (err) return err;
              fs.appendFile('./server-monitor.log', "SERVER_DESTROYED "+JSON.stringify(event)+"\n", function (err) {
                console.log( 'log written' );
              });
            });
          });
        }else{
          fs.appendFile('./server-monitor.log', JSON.stringify(data)+"\n", function (err) {
            console.log( 'log written' );
          });
        }

      });
    });
  });
}
setInterval( checkServers(), 15 * ( 60 * 1000 ) );
