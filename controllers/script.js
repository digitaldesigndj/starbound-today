var sys = require('sys');
var fs = require('fs')
var exec = require('child_process').exec;
var starboundConfig = require('../config/starbound');
var starrypyConfig = require('../config/starrypy3k');
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
  console.log( 'running script', script)

  api.dropletGet( req.user.server, function (err, droplet) {
    if( err ) { res.send( err ); }
    console.log( droplet );
    User.findById(req.user.id, function (err, user) {
      if (err) return next(err);

      if( script === 'restore_world' ) {
        command = 'scp /var/www/starrydex/public/'+req.body.timestamp+'_'+req.body.world_coords+
        ' root@'+droplet.ip_address+':/root/starbound/universe/'+req.body.target_world_coords;
        console.log( command );
        exec(command, function (error, stdout, stderr) { 
          console.log(error, stdout, stderr);
          req.flash('success', { msg: 'World Restored' });
          res.redirect("/server/"+droplet.id+"/worlds/");
        });
      }

      if( script === 'download_world' ) {
        command = "bash " + secrets.server_script_path + "/remote.sh root@" + droplet.ip_address + " 'cp /root/starbound/universe/"+req.body.worldfile+" /root/commandstar/public/css'";
        console.log( command );
        exec(command, function (error, stdout, stderr) {
          console.log(error, stdout, stderr);
          if( droplet.id === 1216418 ) {
            res.redirect("http://"+droplet.ip_address+"/status/css/"+req.body.worldfile);
          }else{
            res.redirect("http://"+droplet.ip_address+"/css/"+req.body.worldfile);
          }
        });
      }

      if( script === 'restart_starrypy3k' ) {
        command = command =  'ssh root@' + droplet.ip_address + ' "pkill python;bash start_starrypy3k.sh"';
        console.log( command );
        exec(command, function (error, stdout, stderr) { 
          // req.flash('success', { msg: 'stdout: ' + stdout });
          console.log(error, stdout, stderr);
          req.flash('success', { msg: 'StarryPy3K Restarted' });
          res.redirect("/");
        });
      }

      if( script === 'soft_restart' ) {
        command = command =  'ssh root@' + droplet.ip_address + ' "shutdown -r now"';
        // console.log( command );
        user.starrypy = false;
        user.save(function (err) {
          exec(command, function (error, stdout, stderr) { 
            console.log(error, stdout, stderr);
            // req.flash('success', { msg: 'stdout: ' + stdout });
            req.flash('success', { msg: 'Server Restarted from the command line.' });
            res.redirect("/");
          });
        })
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
        starboundConfig.gamePort = 21025;
        if( req.body.starrypy == 'true' ) {
          starboundConfig.gamePort = 21024;
        }
        fs.writeFileSync( secrets.server_script_path + '/starbound.config', JSON.stringify( starboundConfig , null, 2 ) );
        command = 'scp ' + secrets.server_script_path + '/starbound.config root@' + droplet.ip_address + ':/root/starbound/starbound.config;bash ' + secrets.server_script_path + '/remote.sh root@' + droplet.ip_address + " 'service starbound restart;pkill python'";
        if( req.body.starrypy == 'true' ) {
          command += ';ssh root@' + droplet.ip_address + ' "bash start_starrypy3k.sh"'
        }
        console.log( command );
        User.findById( req.user.id, function (err, user) {
          if (err) return next(err);
          user.starbound_password = req.body.starbound_password || '';
          user.starrypy = req.body.starrypy || false;
          user.save(function (err) {
            if (err) return next(err);
            exec(command, function (error, stdout, stderr) { 
              if (error !== null) {
                //req.flash('errors', { msg: 'exec error: ' + error });
              }
              if (stderr !== '') {
                //req.flash('errors', { msg: 'stderr: ' + stderr });
              }
              console.log(error, stdout, stderr);
              //req.flash('success', { msg: 'stdout: ' + stdout });
              req.flash('info', { msg: 'Starbound has been reconfigured' });
              if( req.body.starrypy == 'true' ) {
                req.flash('success', { msg: 'StarryPy3k Starting' });
              }else{
                req.flash('success', { msg: 'Vanilla Starbound Starting' });
              }
              res.redirect('/server/'+req.params.id);
            });
          });
        });
      }

      if( script === 'set_owner' ) {
        starrypyConfig.plugins.player_manager.owner_uuid = req.body.uuid;
        fs.writeFileSync( secrets.server_script_path + '/starrypy3k.json', JSON.stringify( starrypyConfig , null, 2 ) );
        command = 'scp ' + secrets.server_script_path + '/starrypy3k.json root@' + droplet.ip_address + ':/root/StarryPy3k/config/config.json;ssh root@' + droplet.ip_address + " 'service starbound restart;pkill python;bash start_starrypy3k.sh'";
        console.log( command );
        User.findById( req.user.id, function (err, user) {
          if (err) return next(err);
          user.uuid = req.body.uuid || '';
          user.save(function (err) {
            if (err) return next(err);
            exec(command, function (error, stdout, stderr) { 
              if (error !== null) {
                //req.flash('errors', { msg: 'exec error: ' + error });
              }
              if (stderr !== '') {
                //req.flash('errors', { msg: 'stderr: ' + stderr });
              }
              console.log(error, stdout, stderr);
              //req.flash('success', { msg: 'stdout: ' + stdout });
              req.flash('info', { msg: 'StarryPy3k has been reconfigured' });
              req.flash('success', { msg: 'StarryPy3k Starting' });
              res.redirect('/server/'+req.params.id);
            });
          });
        });
      }

    });
  });
};
