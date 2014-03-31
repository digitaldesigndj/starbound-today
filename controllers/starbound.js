var sys = require('sys');
// var fs = require('fs');
var exec = require('child_process').exec;
// var starboundConfig = require('../config/starbound');
// var starrypyConfig = require('../config/starrypy3k');
var User = require('../models/User');
var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);
var command = 'cd ~; ls';

function sbCommand( ip_address, command_name, redirect ) { // message )
  command = 'ssh root@'+ip_address+' "source /root/sb-utils/starbound.sh; '+command_name+'"';
  exec(command, function (error, stdout, stderr) { 
    console.log(error, stdout, stderr);
    req.flash('success', { msg: stdout });
    res.redirect(redirect);
  });
}

exports.runUtil = function (req, res) {
  // req.body.command
  // perhaps req.body.starbound_password
  // perhaps req.body.starbound_maxplayers
  // perhaps req.body.worldfile
  // perhaps req.body.timestamp
  // perhaps req.body.target_world_coords
  // perhaps req.body.world_coords
  req.assert('command', 'Please choose a command to run').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/server/'+req.params.id+'/utils');
  }

  var command = req.body.command;

  // req.flash('success', { msg: 'You selected this command: ' + command });
  console.log( 'running command', command)

  api.dropletGet( req.user.server, function (err, droplet) {
    if( err ) { res.send( err ); }
    console.log( droplet );
    User.findById(req.user.id, function (err, user) {
      if (err) return next(err);

      if( command === 'sbhelp' ) {
        sbCommand( droplet.ip_address, command, '/server/'+req.params.id+'/utils' );
      }

    });
  });
};

exports.getUtils = function (req, res) {
  
};
