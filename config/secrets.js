module.exports = {
  db: process.env.MONGODB|| 'mongodb://localhost:27017/starboundToday',

  sessionSecret: process.env.SESSION_SECRET || 'Awesome Your Session Secret goes here',

  server_script_path: '/Users/taylor/Sites/starbound-today/scripts',

  gumroad: {
    seller_id: 'QrnHvi4GB1_lXWah50QkEA==',
    api_key:''
  },

  digitalocean: {
    client_id: '8a1228dd2a3e79f1885b7cf280b485db',
    api_key: '4ade03f8abc0bc16267adb22b63d79c4'
  },

  mailgun: {
    login: 'postmaster@mg.starbound.today',
    password: '75-imgjndxx5'
  },
  
  localAuth: true,
  
  facebookAuth: false,
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'Your App ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'Your App Secret',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  githubAuth: false,
  github: {
    clientID: process.env.GITHUB_ID || 'Your Client ID',
    clientSecret: process.env.GITHUB_SECRET || 'Your Client Secret',
    callbackURL: '/auth/github/callback',
    passReqToCallback: false
  },

  twitterAuth: false,
  twitter: {
    consumerKey: process.env.TWITTER_KEY || 'Your Consumer Key',
    consumerSecret: process.env.TWITTER_SECRET  || 'Your Consumer Secret',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  googleAuth: true,
  google: {
    clientID: process.env.GOOGLE_ID || 'Your Client ID',
    clientSecret: process.env.GOOGLE_SECRET || 'Your Client Secret',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },

  linkedinAuth: false,
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'Your Client ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'Your Client Secret',
    callbackURL: '/auth/linkedin/callback',
    scope: ['r_fullprofile', 'r_emailaddress', 'r_network'],
    passReqToCallback: true
  }
};
