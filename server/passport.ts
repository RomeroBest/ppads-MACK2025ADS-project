import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';
import { InsertUser } from '@shared/schema';

// Set up the Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: '700563013501-4voo9t1g3l5u7u267pq9aski2uf2e0h6.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'https://1da144eb-d308-4261-9aaf-65fbd4885bef-00-27iucyuw30tk0.picard.replit.dev/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists by Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (!user) {
        // Check if user exists by email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        if (email) {
          user = await storage.getUserByEmail(email);
        }
        
        if (!user && email) {
          // Create a new user account
          const newUser: InsertUser = {
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + profile.id.substring(0, 5),
            email: email,
            password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2), // Random password for Google users
            name: profile.displayName,
            googleId: profile.id,
            role: 'user',
            profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
          };
          
          user = await storage.createUser(newUser);
        } else if (user && !user.googleId) {
          // Link Google ID to existing user
          user = await storage.updateUser(user.id, { 
            googleId: profile.id,
            profilePicture: user.profilePicture || (profile.photos && profile.photos[0] ? profile.photos[0].value : null)
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;