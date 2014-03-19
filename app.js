/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');

/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');

var pricingController = require('./controllers/pricing');

var playerManager  = require('./controllers/players');
var worldManager  = require('./controllers/worlds');

var scriptController  = require('./controllers/script');
var serverController  = require('./controllers/server');

// var doEvents  = require('./controllers/digitalocean/events');
// var doInfo  = require('./controllers/digitalocean/info');
var doMakeServer  = require('./controllers/digitalocean/make-server');
// var doMakeImage  = require('./controllers/digitalocean/make-image');
var doManageServer  = require('./controllers/digitalocean/manage-server');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var month = (day * 30);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.token = req.csrfToken();
  res.locals.secrets = secrets;
  next();
});
app.use(flash());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: month }));
app.use(function(req, res, next) {
  // Keep track of previous URL
  if (req.method !== 'GET') return next();
  var path = req.path.split('/')[1];
  if (/(auth|login|logout|signup)$/.test(path)) return next();
  req.session.returnTo = req.path;
  next();
});
app.use(app.router);
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());

/**
 * Application routes.
 */

app.get('/pricing', function(req, res){ res.redirect('/arcade') });
app.get('/monthly', function(req, res){ res.redirect('/arcade') });
app.get('/arcade', pricingController.getArcadePricing);

app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

app.get('/purchase/:hash', require('./controllers/purchase.js') );

app.get('/server/:id/worlds', passportConf.isAuthenticated, worldManager.viewWorlds);
app.get('/server/:id/worlds/send/:world_coords', passportConf.isAuthenticated, worldManager.viewTargetWorlds);
app.get('/server/:id/worlds/send/:world_coords/to/:target_world_coords', passportConf.isAuthenticated, worldManager.sendWorld);
app.get('/server/:id/worlds/save/:world_coords', passportConf.isAuthenticated, worldManager.saveWorld);

app.get('/server/:id/players', passportConf.isAuthenticated, playerManager.viewPlayers);

app.post('/server/boot', passportConf.isAuthenticated, doMakeServer.postMakeServer);
app.get('/server/:id', passportConf.isAuthenticated, serverController.getServer);
app.get('/server/:id/poweroff', passportConf.isAuthenticated, doManageServer.dropletPowerOff);

app.post('/server/:id/runscript', passportConf.isAuthenticated, scriptController.postScript);
app.get('/server/:id/powercycle', passportConf.isAuthenticated, doManageServer.dropletPowerCycle);
// app.get('/server/:id/shutdown', passportConf.isAuthenticated, doManageServer.dropletShutdown);

app.get('/server/:id/poweron', passportConf.isAuthenticated, doManageServer.dropletPowerOn);
app.post('/server/:id/snapshot', passportConf.isAuthenticated, doManageServer.dropletSnapshot);
// app.get('/server/:id/restore', passportConf.isAuthenticated, doManageServer.dropletRestore);
// app.post('/server/rebuild', passportConf.isAuthenticated, doManageServer.dropletRestore);
app.get('/server/:id/rebuild', passportConf.isAuthenticated, doManageServer.selectImage);
// app.post('/server/rebuild', passportConf.isAuthenticated, doManageServer.dropletRebuild);
app.get('/server/:id/destroy', passportConf.isAuthenticated, doManageServer.dropletDestroy);



/**
 * OAuth routes for sign-in.
 */

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

module.exports = app;
