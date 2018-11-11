const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;
const userSchema = new Schema({
    username: String,
    googleId: String,
    facebookId: String,
    token: String,
    email: String
});


const User = mongoose.model('user', userSchema);
module.exports = User;