var secrets = require('../config/secrets');
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Mailgun',
  auth: {
    user: secrets.mailgun.login,
    pass: secrets.mailgun.password
  }
});
var Purchase = require('../models/Purchase');
var User = require('../models/User');


exports.gumroadWebhook = function( req, res ) {
  console.log( 'Webhook!', req.body );
  if (req.user) return res.redirect('/thanks');
  res.set('Content-Type', 'text/plain');
  return res.send("http://" + req.header('host') + "/signup?email=" + req.body.email );//+ "&name=" + req.body.full_name);
}

exports.purchase = function( req, res ) {
  Purchase.findOne({ url_hash: req.params.hash }, function(err, purchase) {
    if (err) return next(err);
    if( purchase != null ) {
      console.log( purchase );
      console.log( purchase.claimed );
      if( purchase.claimed ) {
        res.send('This purchased has been redeemed to ' + purchase.email + '. Thanks!');
      }
      else{
        User.findById(req.user.id, function (err, user) {
          if (err) return next(err);
          // Give 5 Tokens
          user.server.tokens = +user.server.tokens + 5;
          user.save(function (err) {
            if (err) return next(err);
            purchase.claimed = true;
            purchase.save(function(err) {
              if (err) { return err; }
              console.log( 'purchase claimed' );
              req.flash('success', { msg: 'Redeemed tokens to account' + purchase.email + '. Thanks!'});
              res.redirect('/server');
            });
          });
        });
      }
    }
    else {
      res.send( 'Can\'t find it...' );
    }
  });
}

exports.gumroadPurchaseCallback = function( req, res ) {
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
}
