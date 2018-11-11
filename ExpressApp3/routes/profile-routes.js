const router = require('express').Router();

// load profile page
router.get('/', function (req, res) {
    res.render('profile', {
        user: req.user
    });
});

// change username
router.get('/changeUsername', function (req, res) {
    req.logout();
    res.redirect('/auth/login');
});

module.exports = router;