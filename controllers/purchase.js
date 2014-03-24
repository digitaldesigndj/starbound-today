var Purchase = require('../models/Purchase');
var User = require('../models/User');
module.exports = function( req, res ) {

  Purchase.findOne({ url_hash: req.params.hash }, function(err, purchase) {
    if (err) return next(err);
    if( purchase != null ) {
      console.log( purchase );
      console.log( purchase.claimed );
      if( purchase.claimed ) {
        res.send('This purchased has been redeemed to ' + purchase.email + '. Thanks!');
      }
      else{
        if( req.user != undefined ) {
          User.findById(req.user.id, function (err, user) {
            if (err) return next(err);
            var bonus = 0;
            if( user.special_redeemed != false ){
              if( purchase.offer_code == 'boundstar') {
                bonus = 2;
                user.special_redeemed = true;
              }
            }
            user.server_tokens = +user.server_tokens + ( +purchase.price / 50 ) + bonus;
            user.save(function (err) {
              if (err) return next(err);
              purchase.claimed = true;
              purchase.save(function(err) {
                if (err) { return err; }
                console.log( 'purchase claimed' );
                req.flash('success', { msg: 'Redeemed '+( +purchase.price / 50 ) + bonus + ' tokens to account' + purchase.email + '. Thanks!'});
                res.redirect('/');
              });
            });
          });
        }
        else {
          req.flash('success', { msg: 'Please login before checking the status of a purchase.'});
          res.redirect('/login')
        }
      }
    }
    else {
      res.send( 'Can\'t find it...' );
    }
  });
}