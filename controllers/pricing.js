var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var request = require('request');
var _ = require('underscore');
/**
 * GET /arcade, /monthly, /pricing
 * Pricing Page
 */
var price_url = 'https://api.digitalocean.com/sizes/?client_id='
    +secrets.digitalocean.client_id
    +'&api_key='
    +secrets.digitalocean.api_key;


// var pricingCache = '';
// var pricingCacheDate = '';
// var pricingCacheFor = 3600;

// global[''];

var transients = {};

function setTransient( name, url, cacheFor ) {
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

function getTransient( name, callback ) {
  console.log( transients[name] );
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


// function getSizes( callback ) {
//   if( +pricingCacheDate + pricingCacheFor <= Math.round( new Date().getTime() / 1000 ) ) {
//     request( url, function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//         pricingCache = JSON.parse(body).sizes;
//         pricingCacheDate = Math.round( new Date().getTime() / 1000 );
//         if ( typeof callback == 'function' ) {
//           callback( pricingCache );
//         }
//         else {
//           return pricingCache;
//         }
//       }
//     });
//   }else{
//     if ( typeof callback == 'function' ) {
//       callback( pricingCache );
//     }
//     else {
//       return pricingCache;
//     }
//   }
// }
// getSizes();

setTransient( 'sizes', price_url, 3600 );
exports.getArcadePricing = function(req, res) {
  getTransient( 'sizes', function( data ) {
    res.render('pricing', {
      title: 'Arcade Pricing',
      sizes: data.sizes
    });
  });
};