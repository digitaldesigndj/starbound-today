/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  if( req !== undefined ) {
    if( req.user !== undefined ) {
      if( req.user.servers[0] !== undefined ) {
        res.redirect('/server/'+req.user.servers[0]);
      }else{
        res.render('home',{title: 'Coming Soon' });   
      }
    }else{
      res.render('home',{title: 'Coming Soon' });   
    }
  }
  else {
    res.render( 'home', { title: 'Coming Soon' });
  }
};
