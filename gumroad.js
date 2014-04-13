/**
 * Module dependencies.
 * Responds to purchase webhook and creates products on notification
 */

var express = require('express');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');

var secrets = require('./config/secrets');
var mongoose = require('mongoose');
mongoose.connect(secrets.db);
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Mailgun',
  auth: {
    user: secrets.mailgun.login,
    pass: secrets.mailgun.password
  }
});

var Purchase = require('./models/Purchase');
var User = require('./models/User');

var app = express();

// all environments
app.set('port', 3002);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.post('/secret', function( req, res ) {
  console.log( 'Webhook!', req.body );
  res.set('Content-Type', 'text/plain');
  //" + req.header('host') + "
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      console.log( err );
      if( req.body.full_name != undefined ) {
        return res.send("http://starbound.today/signup?email=" + req.body.email + "&name=" + req.body.full_name );
      }
      else {
        return res.send("http://starbound.today/signup?email=" + req.body.email );
      }
    }
    else{
      return res.send("http://starbound.today/login?email=" + req.body.email );
    }
  });
});

app.post('/gumroad', function( req, res ) {
  console.log( req.body );  
  if ( req.body.test ) {
    console.log( 'this was a test' );
  }
  if ( req.body.seller_id === secrets.gumroad.seller_id ) {
    // && req.body.test != 'true' ) { ??
    var hash = crypto.createHash('md5').update(JSON.stringify(req.body)+Math.random()).digest("hex");
    var mailOptions = {
      to: req.body.email,
      from: 'tdy721@gmail.com',
      subject: 'Thanks for your purchase',
      text: 'http://starbound.today/purchase/' + hash
      // , html: fs.readFileSync('./public/email/purchase_thanks.html').toString().replace(/\{\{code\}\}/g, hash)
    };
    // This is a purchase 
    console.log( req.body );
    var purchase = new Purchase({
      url_hash: hash,
      seller_id: req.body.seller_id,
      product_id: req.body.product_id,
      product_name: req.body.product_name,
      permalink: req.body.permalink,
      product_permalink: req.body.product_permalink,
      email: req.body.email,
      price: req.body.price,
      currency: req.body.currency,
      order_number: req.body.order_number,
      full_name: req.body.full_name || '',
      test: req.body.test || false,
      offer_code: req.body.offer_code || false
    });

    if( req.body.permalink != 'boundstar' ) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (err) return next(err);
        console.log(user);
        if( user != null ) {
          console.log(req.body.full_name);
          // user.name = req.body.full_name;
          var total = req.body.price;
          if( user.special_redeemed != false ){
            if( req.body.offer_code == 'boundstar') {
              total = +req.body.price + 100;
              user.special_redeemed = true;
            }
          }
          user.server_tokens = +user.server_tokens + ( +total / 50 );
          purchase.claimed = true;
          purchase.save(function(err) {
            if (err) { return err; }
              console.log( 'purchase saved' );
              user.save(function(err) {
                console.log( 'User bought server tokens, '+req.body.email+' has been creditied' );
                smtpTransport.sendMail(mailOptions, function(err) {
                  if (err) { return err; }
                  res.redirect('/');
                });
              });
          });
        }
        else{
          console.log( 'eMailed purchase code to '+req.body.email+', Waiting to be claimed' );
          purchase.save(function(err) {
            if (err) { return err; }
              console.log( 'purchase saved' );
              smtpTransport.sendMail(mailOptions, function(err, response) {
                if (err) { return err; }
                console.log( response );
                res.redirect('/');
              });
          });
        }
      });
    }
    else {

      mailOptions.subject= 'Thanks for your donation to Boundstar';
      mailOptions.text= 'Your donation code is ' + hash;
      // This is a donation
      Player.findOne({ email: req.body.email }, function(err, player) {
        if (err) return next(err);
        console.log(player);
        if( player != null ) {
          var total = req.body.price;
          player.donations.push( req.body.order_number );
          player.donation_amount = +player.donation_amount + +req.body.price;
          purchase.save(function(err) {
            if (err) { return err; }
              console.log( 'purchase saved' );
              player.save(function(err) {
                console.log( 'Player donated, '+req.body.email+' has been creditied' );
                smtpTransport.sendMail(mailOptions, function(err) {
                  if (err) { return err; }
                  res.redirect('/');
                });
              });
          });
        }
        else{
          console.log( 'eMailed member code to '+req.body.email+', Waiting to be claimed' );
          purchase.save(function(err) {
            if (err) { return err; }
              console.log( 'purchase saved' );
              mailOptions.text: 'Your donation code is ' + hash + '. We could not find an account with your email address, please contact a Boundstar admin with your code or forward this email to tdy721@gmail.com'
              smtpTransport.sendMail(mailOptions, function(err, response) {
                if (err) { return err; }
                console.log( response );
                res.redirect('/');
              });
          });
        }
      });
    }
  }
  else {
    return res.send("go away, seller_id did not match.");
  }
});
