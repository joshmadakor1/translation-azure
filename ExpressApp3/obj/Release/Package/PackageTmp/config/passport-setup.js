const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');

passport.use(
    new GoogleStrategy({
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    },
    function(accessToken, refreshToken, profile, done) {
        // Check if user already exists in DB
        User.findOne({ googleId: profile.id }).then(function (currentUser) {
            if (currentUser) {
                // User Exists
                console.log(`User is: ${currentUser.username}`);
                done(null, currentUser);
            }
            else {
                // Create new user
                new User({
                    username: profile.displayName,
                    googleId: profile.id,
                    email: profile.emails[0].value
                }).save().then(function (newUser) {
                    console.log('New user!!----- ' + newUser);
                    done(null, newUser);
                })
            }
        })
    })
)

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
        done(null, user);
    });
});