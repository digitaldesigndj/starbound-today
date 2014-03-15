var secrets = require('../../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);

exports.getEventJson = function (req, res) {
  api.eventGet(req.query.id, function ( error, event ) {
    res.send( event );
  });
};

exports.getEvent = function (req, res) {
  api.eventGet(req.query.id, function ( error, event ) {
    // console.log( parseInt( event['percentage'] ) );
    console.log( event );
    req.flash('success', { msg: JSON.stringify( event ) });
    // if( parseInt( event['percentage'] ) === 100 ) {
    //   req.flash('success', { msg: "SERVER CREATED, DNS is UPDATING" });
    //   req.flash('success', { msg: "DNS is updating: https://www.whatsmydns.net/#A/node.starbound.today" });
    //   // https://www.whatsmydns.net/#A/node.starbound.today
    //   res.redirect('hosting/servers');
    // }
    // else{
      res.render('hosting/event', {
        'title': 'Event is happening',
        'event': event
      });
    // }
  });
};