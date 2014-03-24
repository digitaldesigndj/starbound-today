var Purchase = require('../models/Purchase');
var User = require('../models/User');
module.exports = function( req, res ) {

  Purchase.findOne({ url_hash: req.params.hash }, function(err, purchase) {
    if (err) return next(err);
    if( purchase != null ) {
      console.log( purchase );
      if( purchase.claimed ) {
        res.send('This purchased has been redeemed to ' + purchase.email + '. Thanks!');
      }
      else{
        if( req.user != undefined ) {
          User.findById(req.user.id, function (err, user) {
            if (err) return next(err);
            var bonus = 0;
            if( purchase.offer_code == 'boundstar') {
              if( user.special_redeemed != true ) {
                bonus = 2;
                user.special_redeemed = true;
              }
              else {
                 req.flash('info', { msg: 'Sorry, you have already recieved your allotment of free tokens, you cannot use that offer twice.' });
              }
            }
            user.server_tokens = parseInt(user.server_tokens) + ( parseInt(purchase.price) / 50 ) + parseInt(bonus);
            user.save(function (err) {
              if (err) return next(err);
              purchase.claimed = true;
              purchase.save(function(err) {
                if (err) { return err; }
                console.log( 'purchase claimed' );
                req.flash('success', { msg: 'Redeemed '+ parseInt( ( parseInt(purchase.price) / 50 ) + parseInt(bonus) ) + ' tokens to account ' + purchase.email + '. Thanks!'});
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