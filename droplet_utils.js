var secrets = require('./config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
// Takes a droplet, returns stats object

var hrMinSec = function(seconds) {
  var sec_num = parseInt(seconds, 10);
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);
  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  var time    = hours+':'+minutes+':'+seconds;
  return time;
}

var calcDropletStats = function(droplet,hourly_price,seconds_per_token,used_tokens) {
  var stats = {};
  var current_time = new Date().getTime()/1000;
  var created_time = new Date(droplet.created_at).getTime()/1000;
  var token_seconds = used_tokens*seconds_per_token;

  stats.life = Math.round(current_time - created_time);
  stats.used_tokens = used_tokens;
  stats.consumed_tokens = Math.round(100*(stats.life/seconds_per_token))/100;
  stats.spent_on_tokens = (Math.round(100*(stats.life/seconds_per_token))/100)*0.5;
  stats.cost = Math.round(100*(Math.round(100*( stats.life/3600 ) )/100 )*hourly_price)/100;
  stats.seconds_left = token_seconds - stats.life;
  stats.time_left = hrMinSec(stats.seconds_left);
  return stats;
}

exports.getDropletStats = function(user,droplet) {
  // 
  var stats = {};
  if ( droplet.size_id == 62 ) { //2GB
    stats = calcDropletStats(droplet,0.02976,43200,user.current_server_used_tokens);
  } else if ( droplet.size_id == 65 ) { //8GB
    stats = calcDropletStats(droplet,0.11905,10800,user.current_server_used_tokens);
  } else if ( droplet.size_id == 61 ) { //16GB
    stats = calcDropletStats(droplet,0.2381,5400,user.current_server_used_tokens);
  }
  // console.log( stats );
  return stats;
}

// Takes a user, droplet and callback, returns event (destruction of droplet)
exports.dropletDestroy = function(user, droplet, callback) {
  // Save a billing entry here -- and delete in manage-server js too...
  var used_tokens = 0;
  var created_time = new Date(droplet.created_at).getTime()/1000;
  var current_time = new Date().getTime()/1000;
  var server_lifetime =  current_time - created_time;
  user.destoryed_servers.push(user.server);
  // Check minimums and adjust
  // switch(droplet.size_id) {
  //   case 62: // 2GB
  //     if( server_lifetime <= 43200) {
  //       // server_lifetime = 43200;
  //       // used_tokens = 1;
  //     // } else {
  //       used_tokens = Math.round(100*((server_lifetime-43200)/43200))/100
  //     }
  //     break;
  //   case 65: // 8GB
  //     if( server_lifetime <= 21600) {
  //       // server_lifetime = 21600;
  //       // used_tokens = 2;
  //     // } else {
  //       used_tokens = Math.round(100*((server_lifetime-10800)/10800))/100
  //     }
  //     break;
  //   case 61: // 16 GB 
  //     if( server_lifetime <= 10800) {
  //       // server_lifetime = 10800;
  //       // used_tokens = 4;
  //     // } else {
  //       used_tokens = Math.round(100*((server_lifetime-5400))/5400))/100
  //     }
  //     break;
  //   default:
  //     console.log('Unknown droplet size')
  // }
  user.used_tokens = user.used_tokens + user.current_server_used_tokens;
  user.billed_seconds = Math.round(user.billed_seconds) + Math.round(server_lifetime);
  user.current_server_used_tokens = 0;
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