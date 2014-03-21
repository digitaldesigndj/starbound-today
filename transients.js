var request = require('request');
var transients = {};
exports.setTransient = function( name, url, cacheFor ) {
  transients[name] = {};
  transients[name].url = url;
  transients[name].cacheFor = cacheFor;
  request( url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      transients[name].data = JSON.parse(body);
      transients[name].cachedAt = Math.round( new Date().getTime() / 1000 );
      return transients[name].data;
    }else {
      return false;
    }
  });
}
exports.getTransient = function( name, callback ) {
  if( transients[name] !== undefined ) {
    if( transients[name].cachedAt + transients[name].cacheFor <= Math.round( new Date().getTime() / 1000 ) ) {
      request( transients[name].url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          transients[name].data = JSON.parse(body);
          transients[name].cachedAt = Math.round( new Date().getTime() / 1000 );
          if ( typeof callback == 'function' ) {
            callback( transients[name].data );
          }
          else {
            return transients[name].data
          }
        }
        else {
          return transients[name].data
        }
      });
    }else{
      if ( typeof callback == 'function' ) {
        callback( transients[name].data );
      }
      else {
        return transients[name].data;
      }
    }
  }
  else {
    return false;
  }
}
