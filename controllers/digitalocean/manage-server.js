var secrets = require('../../config/secrets');
var dropletUtils = require('../../droplet_utils');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);

var _ = require('underscore');
var User = require('../../models/User');

exports.dropletPowerCycle = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletPowerCycle( user.server, function (err, event) {
      if (err) return err;
      req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
      res.redirect('/server/'+user.server);
      // res.redirect('/hosting/event?id='+event);
    });
  });
};

// exports.dropletShutdown = function(req, res) {
//   console.log( user.server );
//   api.dropletShutdown( user.server, function (err, event) {
//     if (err) return err;
//     req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
//     res.redirect('/server/'+user.server);
//     // res.redirect('/hosting/event?id='+event);
//   });
// };

exports.dropletPowerOff = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletPowerOff( user.server, function (err, event) {
      if (err) return err;
      req.flash('success', { msg: JSON.stringify(event) + " POWEROFF - Takes about 10 Seconds" });
      res.redirect('/server/'+user.server);
      // res.redirect('/hosting/event?id='+event);
    });
  });
};

exports.dropletPowerOn = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletPowerOn( user.server, function (err, event) {
      if (err) return err;
      req.flash('success', { msg: JSON.stringify(event) + " POWERON - Takes about 20 Seconds, then another 30 for StarBound to start." });
      res.redirect('/server/'+user.id);
      // res.redirect('/hosting/event?id='+event);
    });
  });
};

exports.dropletSnapshot = function(req, res) {
  User.findById( req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletSnapshot( user.server, { name: user.profile.domain }, function (err, event_id) {
      if (err) return err;
      api.eventGet(event_id, function ( error, event ) {
        req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, this usually takes about 10 min." });
        res.redirect( '/server' );
        // res.redirect('/hosting/event?id='+event_id);
      });
    });
  });
};

// exports.dropletRestore = function(req, res) {
//   console.log( req.user.server.image );

//   // api.dropletRestore( user.server, req.user.server.image, function (err, event) {
//   //   if (err) return err;
//   //   req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
//   //   res.redirect('/server/'+user.server);
//   //   // res.redirect('/hosting/event?id='+event);
//   // });
// };

// exports.dropletRebuild = function(req, res) {
//   console.log( user.server );
//   api.dropletRebuild( user.server, function (err, event) {
//     if (err) return err;
//     req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
//     res.redirect('/server/'+user.server);
//     // res.redirect('/hosting/event?id='+event);
//   });
// };

exports.dropletDestroy = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return err;
    api.dropletGet( user.server, function (err, droplet) {
      if (err) return err;
      dropletUtils.dropletDestroy( user, droplet, function( event ) {
        req.flash('warning', { msg: "Server Destroyed" });
        res.redirect('/');
      });
    });
  });
};

// exports.selectImage = function (req, res) {
//   // size_id 66 = 512MB
//   api.imageGetAll(function (error, images) {
//     res.render('hosting/make/server', {
//       'title': 'Rebuild',
//       'tagline': 'Pick an Image to rebuild from',
//       'images': images
//     });
//   });
// };
