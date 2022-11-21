if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const app = express();
const serverPort = 3000;
const initializePassport = require('./passport-config');
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
),
  //View Engine
  app.set('view-engine', 'ejs');

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

//It's the worst way to store data but we are practicing here, right?
const users = [];

//GET Routes
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.status(200).render('login.ejs');
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.status(200).render('register.ejs');
});

app.get('/', checkAuthenticated, (req, res) => {
  res.status(200).render('index.ejs', { name: req.user.name });
});

app.get('/error', (req, res) => {
  res.status(200).render('error.ejs');
});

//POST Routes
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect('/login');
  } catch {
    res.status(400).redirect('/error');
  }
  console.log(users);
});
app.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

//DELETE Routes
app.delete('/logout', (req, res) => {
  req.logOut(()=>{})
  res.redirect('/login');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(200).redirect('/login');
}
function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(200).redirect('/');
}

//Starting Server
app.listen(3000, () => {
  console.log(`Port : ${serverPort}   Here We Go`);
});
