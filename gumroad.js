/**
 * Module dependencies.
 * Responds to purchase webhook and creates products on notification
 */

var express = require('express');
var http = require('http');
var path = require('path');

var secrets = require('./config/secrets');
var crypto = require('crypto');
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
  return res.send("http://starbound.today/signup?email=" + req.body.email + "&name=" + req.body.full_name);
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
      text: 'http://my.starbound.today/purchase/' + hash
    };
    // This is a purchase 
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
      test: req.body.test || false
    });

    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) return next(err);
      if( user != null ) {
        console.log(user);
        user.profile.name = req.body.full_name;
        user.server.tokens = parseFloat(Math.round(10*user.server.tokens)/10)+10;
        purchase.claimed = true;
        purchase.save(function(err) {
          if (err) { return err; }
            console.log( 'purchase saved' );
            user.save(function(err) {
              console.log( 'user saved');
              // 'You bought server tokens! They have been added to your account:'
              smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                  req.flash('errors', { msg: err.message });
                  return res.redirect('/server');
                }
                req.flash('success', { msg: 'Email has been sent successfully!' });
                res.redirect('/server');
              });
            });
        });
      }else{
        // EMailed Waiting to be claimed
        purchase.save(function(err) {
          if (err) { return err; }
            console.log( 'purchase saved' );
            var mailOptions = {
              to: req.body.email,
              from: 'tdy721@gmail.com',
              subject: 'Thanks for your purchase',
              text: 'You bought server tokens! Register, then claim them with this url: http://my.starbound.today/purchase/' + hash
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              if (err) {
                req.flash('errors', { msg: err.message });
                return res.redirect('/server');
              }
              req.flash('success', { msg: 'Email has been sent successfully!' });
              res.redirect('/server');
            });
        });
      }
    });
  }
  else {
    return res.send("go away, seller_id did not match.");
  }
});
