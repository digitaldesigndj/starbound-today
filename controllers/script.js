var sys = require('sys');
var fs = require('fs')
var exec = require('child_process').exec;
var starboundConfig = require('../config/starbound');
var User = require('../models/User');
var secrets = require('../config/secrets');
var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(secrets.digitalocean.client_id, secrets.digitalocean.api_key);

/**
 * POST /admin
 * Runs Bash Scripts
 */

exports.postScript = function (req, res) {
  //req.body.script
  //perhaps req.body.password
  //parhaps req.body.worldfile
  req.assert('script', 'BAD BAD BAD BAD NO! Choose a script to run').notEmpty();
  if( req.body.starbound_password !== undefined && req.body.starbound_password !== '' ) {
    req.assert('starbound_password', 'Server Password must be letters only').isAlpha();
  }
  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/server/'+req.params.id);
  }

  var command = 'cd ~; ls';
  var script = req.body.script;

  // req.flash('success', { msg: 'You selected this script: ' + script });

  api.dropletGet( req.user.servers[0], function (err, droplet) {
    if( err ) { res.send( err ); }
    console.log( droplet );
    User.findById(req.user.id, function (err, user) {
      if (err) return next(err);
      if( script === 'download_world' ) {
        command = "bash " + secrets.server_script_path + "/remote.sh root@" + droplet.ip_address + " 'cp /root/starbound/universe/"+req.body.worldfile+" /root/commandstar/public/css'";
        exec(command, function (error, stdout, stderr) { 
          if( droplet.id === 1216418 ) {
            res.redirect("http://"+droplet.ip_address+"/status/css/"+req.body.worldfile);
          }else{
            res.redirect("http://"+droplet.ip_address+"/css/"+req.body.worldfile);
          }
        });
      }

      if( script === 'restart' ) {
        command = "bash " + secrets.server_script_path + "/remote.sh root@" + droplet.ip_address + " 'restart starbound'";
        console.log( command );
        exec(command, function (error, stdout, stderr) { 
          if (error !== null) {
            // req.flash('errors', { msg: 'exec error: ' + error });
          }
          if (stderr !== '') {
            // req.flash('errors', { msg: 'stderr: ' + stderr });
          }
          // req.flash('success', { msg: 'stdout: ' + stdout });
          req.flash('success', { msg: 'Starbound Restarted' });
          res.redirect('/server/'+req.params.id);
        });
      }
      if( script === 'web' ) {
        // forever start ./node_modules/coffee-script/bin/coffee lib/commandstar.coffee
        command =  'ssh root@' + droplet.ip_address + ' "export PATH=$PATH:/root/.nvm/v0.10.16/bin;cd /root/commandstar;forever stopall;forever start ./node_modules/coffee-script/bin/coffee lib/commandstar.coffee;sleep 2"';
        // console.log( command );
        exec(command, function (error, stdout, stderr) { 
          if (error !== null) {
            // req.flash('errors', { msg: 'exec error: ' + error });
          }
          if (stderr !== '') {
            // req.flash('errors', { msg: 'stderr: ' + stderr });
          }
          req.flash('success', { msg: 'Command Star Started!' });
          res.redirect('/server/'+req.params.id);
        });
      }
      if( script === 'password' ) {
        starboundConfig.serverPasswords = [req.body.starbound_password];
        // console.log( starboundConfig )
        fs.writeFileSync( secrets.server_script_path + '/starbound.config', JSON.stringify( starboundConfig , null, 2 ) );
        command = 'scp ' + secrets.server_script_path + '/starbound.config root@' + droplet.ip_address + ':/root/starbound/starbound.config;bash ' + secrets.server_script_path + '/remote.sh root@' + droplet.ip_address + " 'service starbound restart'";
        User.findById( req.user.id, function (err, user) {
          if (err) return next(err);
          user.starbound_password = req.body.starbound_password || '';
          user.save(function (err) {
            if (err) return next(err);
            exec(command, function (error, stdout, stderr) { 
              if (error !== null) {
                //req.flash('errors', { msg: 'exec error: ' + error });
              }
              if (stderr !== '') {
                //req.flash('errors', { msg: 'stderr: ' + stderr });
              }
              //req.flash('success', { msg: 'stdout: ' + stdout });
              req.flash('success', { msg: 'password set, starbound restarted' });
              res.redirect('/server/'+req.params.id);
            });
          });
        });
      }
    });
  });
};
