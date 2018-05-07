const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');


// serialize && deserialize 

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//middleware
passport.use('local-login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
},(req, email, password, done) => {
    User.findOne({email: email}, (err, user) => {
        if(err) return done(err);

        if(!user){
            return done(null, false, req.flash('loginMessage', 'No User has been found ...'));
        }
        if(!user.comparePassword(password)){
            return done(null, false , req.flash('loginMessage', 'Wrong Password ...'));
        }
        return done(null, user);
    });
}));


//custom validation 

exports.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');

}