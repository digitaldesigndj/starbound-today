var secrets = require('../../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
// var _ = require('underscore');
var User = require('../../models/User');

exports.getMakeDomainRecord = function (req, res) {
  // size_id 66 = 512MB
  api.imageGetAll(function (error, images){
    res.render('hosting/make/server', {
      'title': 'Spin Up A Server',
      'tagline': 'Ha-Ha! Just kidding, they\'re SSD!',
      'images': images
    });
  });
};

exports.postMakeDomainRecord = function (req, res) {
  api.dropletGet( req.params.id, function (err, droplet) {
    if( err ) { res.send( err ); }
    console.log( droplet );
    User.findById(req.user.id, function (err, user) {
      if (err) return next(err);
      // boundstar.com - 152674
      // starbound.today - 207414
      api.domainRecordNew( '207414', 'A', new_server.ip_address, { 'name': req.body.name }, function ( err, domain_reponse ) {
        if( err ) { res.send( err ); }
        console.log( domain_reponse );
        req.flash('success', { msg: req.body.name + ' created at ' + new_server.ip_address + ', will be ready in ~5 Min ' });
        req.flash('success', { msg: JSON.stringify(event) });
        res.redirect('/server/'+req.params.id);
      });
      user.server = droplet.id;
      user.save(function (err) {
        if (err) return next(err);
        console.log("Made Server", droplet.ip_address);
        req.flash('success', { msg: 'We\'re Booting Up a server at: '+droplet.ip_address });
        res.redirect('/');
      });
    });
  });
};

    // Create DNS Record
    // For Later
    // api.domainRecordNew( '152674', 'A', new_server.ip_address, { 'name': req.body.name }, function ( err, domain_reponse ) {
    //   if( err ) { res.send( err ); }
    //   console.log( domain_reponse );
    //   req.flash('success', { msg: req.body.name + ' created at ' + new_server.ip_address + ', will be ready in ~5 Min ' });
    //   req.flash('success', { msg: JSON.stringify(event) });
    //   res.redirect('/hosting/event?id='+event.id);
    // });

    // Get Droplet Info
    // api.dropletGetAll( function ( error, data ) {
    //   if( err ) { res.send( err ); }
    //   var new_server = _.findWhere( data, { name: req.body.name + '.starbound.today' });
    //   console.log( new_server );