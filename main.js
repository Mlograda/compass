if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

const methodOverride = require("method-override");
const engine = require("ejs-mate");

const ExpressError = require("./utilities/ExpressError");
const Review = require('./models/review');
const session = require('express-session')
const flash = require('connect-flash')

const campgroundsRoute = require('./routes/campgrounds')
const reviewsRoute = require('./routes/reviews')
const User = require('./models/user')
const usersRoute = require('./routes/users')
const aboutRoute = require('./routes/about')
const passport = require('passport')
const localStrategy = require('passport-local')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo')

app.engine("ejs", engine);
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
  replaceWith: '_'
}))
//  DB_URL='YOUR MONGODB ATLAS URL'
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/compass';
//  SECRET='YOUR SESSION SECRET KEY'
const secret = process.env.SECRET || 'UnderDevelopmentSecret';

mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("we are connected to data base");
});



const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbURL,
    secret,
    touchAfter: 24 * 60 * 60
  }),
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}


app.use(session(sessionConfig));
app.use(flash())
app.use(helmet())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy({ usernameField: 'checking', passwordField: 'password' }, User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/* Configuring ContentSecurityPolicy for Helmet to enable loading scripts defined only in this app *//* Removing the below configuration will block scripts on the application*/

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
  "https://cdnjs.cloudflare.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
];
const fontSrcUrls = ["https://cdnjs.cloudflare.com/",];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dq6oml6je/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
        "https://images.unsplash.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

/* END OF--- Configuring ContentSecurityPolicy for Helmet */

app.use((req, res, next) => {

  res.locals.currentUser = req.user

  res.locals.registerUser = req.body
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})



app.use('/', usersRoute)
app.use('/campgrounds', campgroundsRoute)
app.use('/campgrounds/:id/reviews', reviewsRoute)
app.get('/', (req, res, next) => {
  res.render('home')
})
app.post('/search', (req, res, next) => {
  res.send(req.body)
})

app.use('/about', aboutRoute)



app.all('*', (res, req, next) => {
  next(new ExpressError('Page Not found!', 404));
})
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = ('Something went wrong');
  res.status(statusCode).render('error', { err });

});

const port = process.env.PORT || '3000';
app.listen(port, () => {
  console.log(`SERVING ON PORT ${port}`);
});
