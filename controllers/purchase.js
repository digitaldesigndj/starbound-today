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
        User.findById(req.user.id, function (err, user) {
          if (err) return next(err);
          // Give 5 Tokens
          user.server.tokens = +user.server.tokens + ( +purchase.price / 50 );
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