const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const keys = require('./keys');
const User = require('../models/user-model');

passport.use(new FacebookStrategy({
    clientID: keys.facebook.clientID,
    clientSecret: keys.facebook.clientSecret,
    callbackURL: keys.facebook.callbackURL,
    profileFields: ['email', 'first_name']
},
    function (accessToken, refreshToken, profile, done) {
        console.log('profile!@!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!---------');
        console.log(profile.name.givenName);
        console.log('profile!@!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!---------');
        process.nextTick(function () {
            User.findOne({ 'facebookId': profile.id }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(null, user);
                }
                else {
                    let newUser = new User();
                    newUser.facebookId = profile.id;
                    newUser.token = accessToken;
                    if (profile.displayName) { newUser.username = profile.displayName; }
                    else { newUser.username = "user" + profile.id}
                    if (newUser.firstName) { newUser.firstName = profile.name.givenName; }
                    else { newUser.firstName = "user" + profile.id }
                    if (profile.emails) { newUser.email = profile.emails[0].value; }
                    else { newUser.email = "user" + profile.id; }
                    console.log('NEW USER ---------------------------------');
                    console.log(newUser);
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }
));

passport.use(
    new GoogleStrategy({
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    },
    function(accessToken, refreshToken, profile, done) {
        let firstName = "";
        if (profile.displayName.indexOf(" ") > 0) {
            firstName = profile.displayName.split(" ")[0];
        }
        else {
            firstName = profile.displayName;
        }
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
                    firstName: firstName,
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