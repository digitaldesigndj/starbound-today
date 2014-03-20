var secrets = require('./config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
// Takes a droplet, returns stats object
exports.getDropletStats = function(droplet) {
  var stats = {};
  var current_time = new Date().getTime()/1000;
  var created_time = new Date(droplet.created_at).getTime()/1000;
  stats.life = Math.round(current_time - created_time);
  // stats.tokens = Math.round(100*(current_use - stats.spent))/100;
  if ( droplet.size_id == 62 ) { //2GB
    stats.tokens = Math.round(100*(stats.life/43200))/100;
    stats.spent = (Math.round(100*(stats.life/43200))/100)*0.5;
    stats.cost = Math.round(100*(Math.round(100*( stats.life/3600 ) )/100 )*0.02976)/100;
  } else if ( droplet.size_id == 65 ) { //8GB
    stats.tokens = Math.round(100*(stats.life/10800))/100;
    stats.spent = (Math.round(100*(stats.life/10800))/100)*0.5;
    stats.cost = Math.round(100*(Math.round(100*( stats.life/3600 ) )/100 )*0.11905)/100;
  } else if ( droplet.size_id == 61 ) { //16GB
    stats.tokens = Math.round(100*(stats.life/5400))/100;
    stats.spent = (Math.round(100*(stats.life/5400))/100)*0.5;
    stats.cost = Math.round(100*(Math.round(100*( stats.life/3600 ) )/100 )*0.2381)/100;
  }
  console.log( stats );
  return stats;
}

// Takes a user, droplet and callback, returns event (destruction of droplet)
exports.dropletDestroy = function(user, droplet, callback) {
  // Save a billing entry here -- and delete in manage-server js too...
  var used_tokens = 1;
  var created_time = new Date(droplet.created_at).getTime()/1000;
  var current_time = new Date().getTime()/1000;
  var server_lifetime =  current_time - created_time;
  user.destoryed_servers.push(user.server);
  // Check minimums and adjust
  switch(droplet.size_id) {
    case 62: // 2GB
      if( server_lifetime <= 43200) {
        server_lifetime = 43200;
        used_tokens = 1;
      } else {
        used_tokens = Math.round(100*(server_lifetime/43200))/100
      }
      break;
    case 65: // 8GB
      if( server_lifetime <= 21600) {
        server_lifetime = 21600;
        used_tokens = 2;
      } else {
        used_tokens = Math.round(100*(server_lifetime/10800))/100
      }
      break;
    case 61: // 16 GB 
      if( server_lifetime <= 10800) {
        server_lifetime = 10800;
        used_tokens = 4;
      } else {
        used_tokens = Math.round(100*(server_lifetime/5400))/100
      }
      break;
    default:
      console.log('Unknown droplet size')
  }
  user.used_tokens = used_tokens;
  user.billed_seconds = Math.round(user.billed_seconds) + Math.round(server_lifetime);
  user.server = 0;
  console.log( created_time, current_time, server_lifetime );
  console.log( 'Destroying droplet', droplet.id );
  api.dropletDestroy( droplet.id, function ( err, event ) {
    if (err) return err;
    user.save( function(err) {
      if (err) return err;
      return callback(event);
    });
  });
}