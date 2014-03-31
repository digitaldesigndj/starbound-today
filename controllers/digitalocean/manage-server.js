var secrets = require('../../config/secrets');
var dropletUtils = require('../../droplet_utils');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var User = require('../../models/User');
var _ = require('underscore');

function eventHappens(err, event, message, id) {
  if (err) return err;
  res.redirect('/server/'+id+'/event/'+event);
}

exports.snapshotErase = function( req, res ) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletGet( user.server, function ( err, droplet ) {
      if( droplet.snapshots != '[]' ) {
        api.imageDestroy( req.params.snapshot_id, function( err, event ) {
          console.log( event );
          res.redirect('/server/'+req.params.id+'/event/'+event);
        });
      }
    });
  });
}

exports.getSnapshots = function( req, res ) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.imageGetMine( function ( err, images ) {
      res.render('snapshots', {
        title: 'Your Snapshots',
        snapshots: _.filter(images, function(image) {
          return ~image.name.indexOf(user.email.replace('@','-at-'));
        })
      });
    });
  });
}
// res.redirect('/server/'+req.params.id);

exports.dropletRestoreSnapshot = function( req, res ) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletGet( user.server, function ( err, droplet ) {
      if( droplet.snapshots != '[]' ) {
        api.dropletRestore( req.params.id, req.params.snapshot_id, function( err, event ) {
          res.redirect('/server/'+req.params.id+'/event/'+event);
        });
      }
    });
  });
}
// This will be a mirror copy of the image or snapshot to your droplet. Be sure you have backed up any necessary information prior to restore.
exports.dropletPowerCycle = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    user.starrypy = false;
    user.save( function (err) {
      if (err) return err;
      api.dropletPowerCycle( user.server, function (err, event) {
        if (err) return err;
        // req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
        res.redirect('/server/'+req.params.id+'/event/'+event);
        // res.redirect('/hosting/event?id='+event);
      });
    });
  });
};

exports.dropletPowerOff = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    user.starrypy = false;
    user.save( function (err) {
      if (err) return err;
      api.dropletPowerOff( user.server, function (err, event) {
        if (err) return err;
        console.log( event );
        // req.flash('success', { msg: JSON.stringify(event) + " POWEROFF - Takes about 10 Seconds" });
        res.redirect('/server/'+req.params.id+'/event/'+event);
        // res.redirect('/hosting/event?id='+event);
      });
    });
  });
};

exports.getEvent = function(req, res) {
  api.eventGet( req.params.event_id, function (err, event) {
    if (err) return err;
    if( event.action_status == 'done' ) {
      // req.flash('success', { msg: JSON.stringify(event) + " Event Complete!" });
      res.redirect('/server/'+req.params.id);
    }
    else {
      res.render('event', {
        title:'Server Event Processing',
        event: event
      });
    }
    // res.redirect('/server/'+req.params.id+'/event/'+req.params.event_id);
    // res.redirect('/hosting/event?id='+event);
  });
};

exports.dropletPowerOn = function(req, res) {
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);
    api.dropletPowerOn( user.server, function (err, event) {
      if (err) return err;
      console.log( event );
      // req.flash('success', { msg: JSON.stringify(event) + " POWERON - Takes about 20 Seconds, then another 30 for StarBound to start." });
      res.redirect('/server/'+user.server+'/event/'+event);
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
        if (err) return err;
        console.log( event );
        // req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, this can take up to 10 min, but usually 3-5." });
        // res.redirect( '/server' );
        res.redirect('/server/'+user.server+'/event/'+event.id);
      });
    });
  });
};

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

// exports.dropletRestore = function(req, res) {
//   console.log( req.user.server.image );

//   // api.dropletRestore( user.server, req.user.server.image, function (err, event) {
//   //   if (err) return err;
//   //   req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
//   //   res.redirect('/server/'+req.params.id+'/event/'+event);
//   //   // res.redirect('/hosting/event?id='+event);
//   // });
// };

// exports.dropletRebuild = function(req, res) {
//   console.log( user.server );
//   api.dropletRebuild( user.server, function (err, event) {
//     if (err) return err;
//     req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
//     res.redirect('/server/'+req.params.id+'/event/'+event);
//     // res.redirect('/hosting/event?id='+event);
//   });
// };

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

// exports.dropletShutdown = function(req, res) {
//   console.log( user.server );
//   api.dropletShutdown( user.server, function (err, event) {
//     if (err) return err;
//     req.flash('success', { msg: JSON.stringify(event) + " - your event is processing, refresh the page in 10 seconds" });
//     res.redirect('/server/'+req.params.id+'/event/'+event);
//     // res.redirect('/hosting/event?id='+event);
//   });
// };