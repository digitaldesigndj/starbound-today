var secrets = require('./config/secrets');
var mongoose = require('mongoose');
mongoose.connect(secrets.db);

var Purchase = require('./models/Purchase');
var purchase = new Purchase();
purchase.claimed = true;

purchase.save(function(err, purchase) {
  if (err) { return err; }
  console.log(purchase);
  console.log( 'purchase saved' );
});
