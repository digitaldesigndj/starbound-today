// Copy this into secrets.js and add your own info. None of the auth routes are actually required, but the other stuff is essential.
module.exports = {
  db: process.env.MONGODB || 'mongodb://localhost:27017/databaseName',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  server_script_path: 'Absolute path to scripts directory',

  gumroad: {
    seller_id: 'Your Gumroad Seller ID'
  },

  digitalocean: {
    client_id: 'DO Client ID',
    api_key: 'DO API Key'
  },

  mailgun: {
    login: 'Mailgun login',
    password: 'Mailgun Password'
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

  googleAuth: false,
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
