// Load environment variables from .env file
require('dotenv').config();

// Importing necessary libraries and modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const accountController = require('./controllers/accountController');
const searchFlightsRoutes = require('./routes/searchFlights');
const axios = require('axios');

// Initialize express app
const app = express();

// Session configuration for express
app.use(session({
  secret: 'some secret value', // Replace with your own secret key
  resave: false,
  saveUninitialized: false,
}));

// Body parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Passport configuration
require('./middlewares/auth.js')();
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
app.use(passport.initialize());

// CORS options and setup
const corsOptions = {
  origin: 'http://127.0.0.1:3000', // Allow only http://127.0.0.1:3000
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
  credentials: true, // Allow cookies to be sent with the request
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect('mongodb+srv://airfly_db:airfly_db@renee.iku2dns.mongodb.net/renee', {
  retryWrites: true,
  w: 'majority'
}).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error('Connection error', err);
});


// Express JSON parser
app.use(express.json());

// Routes
app.use('/api/search-flights', searchFlightsRoutes);
app.get('/profile', passport.authenticate('jwt', { session: false }), accountController.profile);
app.post('/login', passport.authenticate('local'), accountController.login);
app.post('/register', cors(corsOptions), accountController.register); // Added cors() here

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to AirFly Backend!');
});

// Server setup
const port = 3001;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});









