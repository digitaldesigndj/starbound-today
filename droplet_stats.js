// Takes a droplet, returns stats object
module.exports = function(droplet) {
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