import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { env } from './env.js';

// User serialization for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: env.googleClientId,
  clientSecret: env.googleClientSecret,
  callbackURL: `${env.backendUrl}/api/auth/google/callback`,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth callback received', { profileId: profile.id });
    
    const user = {
      id: profile.id,
      provider: 'google',
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      avatar: profile.photos?.[0]?.value,
      accessToken,
      refreshToken
    };
    
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error', error);
    return done(error, null);
  }
}));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
  clientID: env.microsoftClientId,
  clientSecret: env.microsoftClientSecret,
  callbackURL: `${env.backendUrl}/api/auth/microsoft/callback`,
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Microsoft OAuth callback received', { profileId: profile.id });
    
    const user = {
      id: profile.id,
      provider: 'microsoft',
      email: profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName,
      name: profile.displayName,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      avatar: null,
      accessToken,
      refreshToken
    };
    
    return done(null, user);
  } catch (error) {
    console.error('Microsoft OAuth error', error);
    return done(error, null);
  }
}));

export default passport;
