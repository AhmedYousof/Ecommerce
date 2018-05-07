const express =  require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const engine = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

const secret = require('./config/secret');
const User = require('./models/user');
const Product = require('./models/product');
const Category = require('./models/category');
const cartLength = require('./middlewares/middlewares');


mongoose.connect(secret.datapase, (err) => {
if (err) console.log(err);

console.log('Connected to database..');
});

//middleware
app.use(express.static(__dirname+'/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({url: secret.datapase, autoReconnect: true})

}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user ;
    next();
});

app.use(cartLength);
app.use( (req, res, next) => {
    Category.find({}, (err, categories) => {
        if(err) return next(err);
        res.locals.categories = categories;
        next();
    });
});




app.engine('ejs', engine);
app.set('view engine', 'ejs');

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./api/api'); 
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);



app.listen(secret.port, (err) => {
    if (err) throw err;
    console.log('Server is Running...');

});
