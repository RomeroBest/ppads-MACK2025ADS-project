import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  // Aqui é onde você faz a lógica de buscar ou criar usuário no DB
  // Exemplo:
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails?.[0].value,
    username: profile.emails?.[0].value.split("@")[0],
    role: "user",
  };

  return done(null, user);
}));

export default passport;
