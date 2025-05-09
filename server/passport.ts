
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';
import { InsertUser } from '@shared/schema';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.APP_URL) {
  throw new Error("Missing required environment variables for Google OAuth");
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/google/callback`,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (!user) {
        const email = profile.emails?.[0]?.value;
        
        if (email) {
          user = await storage.getUserByEmail(email);
        }
        
        if (!user && email) {
          const newUser: InsertUser = {
            username: `${profile.displayName.replace(/\s+/g, '').toLowerCase()}_${Date.now()}`,
            email,
            password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
            name: profile.displayName,
            googleId: profile.id,
            role: 'user',
            profilePicture: profile.photos?.[0]?.value || null
          };
          
          user = await storage.createUser(newUser);
        } else if (user && !user.googleId) {
          user = await storage.updateUser(user.id, { 
            googleId: profile.id,
            profilePicture: user.profilePicture || profile.photos?.[0]?.value || null
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
