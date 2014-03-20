var secrets = require('./config/secrets');
var dropletUtils = require('./droplet_utils');
var User = require('./models/User');

var mongoose = require('mongoose');
mongoose.connect(secrets.db);

var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);

var fs = require('fs');
var _ = require('underscore');

var checkServers = function () {
  console.log( '| Doing Server Check' );
  fs.appendFile('./server-monitor.log', "Check at "+new Date()+"\n", function (err) {
    console.log( 'log written' );
  });
  User.find(  { server: { $gt: 1 } }, function(err,users) {
    if (err) return err;
    _.each( users, function( user ) {
      api.dropletGet( user.server, function ( err, droplet ) {
        if (err) return err;
        console.log( droplet.name, droplet.id, user.server_tokens);
        var data = dropletUtils.getDropletStats( droplet );
        data.current = Math.round(100*(user.server_tokens-data.tokens))/100;;
        data.name = droplet.name;
        data.id = droplet.id;
        data.time = new Date();
        console.log( data );
        if( data.current <= 0 ) {
          dropletUtils.dropletDestroy( user, droplet, function( event ) {
            fs.appendFile('./server-monitor.log', JSON.stringify(data)+"\n"+"SERVER_DESTROYED "+JSON.stringify(event)+"\n", function (err) {
              console.log( 'log written' );
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
