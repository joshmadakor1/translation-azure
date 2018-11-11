const router   = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login', function (req, res) {
    res.render('login', {
        user : req.user
    });
});

// auth logout
router.get('/logout', function (req, res) {
    //handle with passport
    req.logout();
    res.redirect('/auth/login');
});

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));


// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), function (req, res) {
    res.redirect('/profile');
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/login' }));

module.exports = router; 