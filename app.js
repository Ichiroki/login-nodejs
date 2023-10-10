const express = require('express');
const mongoose = require('mongoose');
const authController = require('./controllers/authController')
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const session = require('express-session')
const flash = require('express-flash')

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: '7d7459e28954f4eb5086ac17f3539cfe94c883dbe1c9dc3182c4bbed6125edb8',
  resave: true,
  saveUninitialized: true
}))
app.get(flash())

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb://127.0.0.1:27017/jwtAuth';
mongoose.connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home', { active: 'Home' }));

app.get('/signup', authController.signup_get);
app.post('/signup', authController.signup_post);
app.get('/login', authController.login_get);
app.post('/login', authController.login_post);
app.get('/logout', authController.logout_get);

app.get('/menu', requireAuth, (req, res) => res.render('menu', {active: 'Menu'}));

