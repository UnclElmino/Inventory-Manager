const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../models'); // { User, ... }

passport.serializeUser((user, done) => {
  done(null, user.id); // keep the session small
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id);
    done(null, user || false);
  } catch (e) { done(e); }
});

function upsertOAuthUser({ provider, id, profile }) {
  const email = profile.emails && profile.emails[0] && profile.emails[0].value ? profile.emails[0].value : null;
  const name  = profile.displayName || (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : 'User');
  const avatar_url = (profile.photos && profile.photos[0] && profile.photos[0].value) ? profile.photos[0].value : null;

  return db.User.findOne({ where: email ? { email } : { provider, provider_id: id } })
    .then(async (existing) => {
      if (existing) {
        // update avatar/name if empty
        if (!existing.avatar_url && avatar_url) existing.avatar_url = avatar_url;
        if (!existing.name && name) existing.name = name;
        if (!existing.provider) existing.provider = provider;
        if (!existing.provider_id) existing.provider_id = id;
        await existing.save();
        return existing;
      }
      // create
      return db.User.create({
        name,
        email,        // may be null for FB if permissions don’t include email
        avatar_url,
        is_admin: false,
        is_blocked: false,
        provider,
        provider_id: id
      });
    });
}

// Google
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await upsertOAuthUser({ provider: 'google', id: profile.id, profile });
    done(null, user);
  } catch (e) { done(e); }
}));

// Facebook
passport.use(new FacebookStrategy({
  clientID:     process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL:  process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id','displayName','photos','email']  // request email if available
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await upsertOAuthUser({ provider: 'facebook', id: profile.id, profile });
    done(null, user);
  } catch (e) { done(e); }
}));

module.exports = passport;