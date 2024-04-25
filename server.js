// Imports
import path from "path";
import https from "https";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import cookieSession from "cookie-session";

// Constants and Configuration
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
// Middleware Setup
const app = express();
app.use(helmet());


app.use(cookieSession({
  name:'session',
  maxAge:24*60*60*1000,
  keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2]
}))


console.log("clientid", process.env.CLIENT_ID); // Check if CLIENT_ID is loaded correctly
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1:process.env.COOKIE_KEY_1,
  COOKIE_KEY_2:process.env.COOKIE_KEY_2
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  done(null, profile);
}


// Passport Strategy Setup
const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};
console.log("client-secret", AUTH_OPTIONS.clientSecret);


  passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

  app.use(passport.initialize());

  
// Route Handlers
function checkLoggedIn(req, res, next) {
  console.log('current user is:',req.user);
  const isLoggedIn = true; // Replace this with actual authentication logic
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must be logged in!",
    });
  }
  next();
}


app.get("/auth/google", passport.authenticate("google", { scope: ["email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false,
  }),
  (req, res) => {
    console.log("Google callback called");
  }
);

app.get("/failure", (req, res) => {
  return res.send("Failed to login ");
});

app.get("/auth/logout", (req, res) => {
  // Implement logout logic
});

app.get("/secret", checkLoggedIn, (req, res) => {
  res.send("Your personal secret value is 42!");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Server Setup
try {
  const server = https.createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  );

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
} catch (error) {
  console.error("Error starting HTTPS server:", error);
}
