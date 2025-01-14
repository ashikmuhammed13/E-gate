const express = require('express'); 
const connectDB = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoDbStore = require("connect-mongodb-session")(session); // Import and configure mongoDbStore
const hbs = require("express-handlebars")
const cors = require('cors'); // To handle CORS issues in development

require('dotenv').config();

const app = express();

const user = require("./routes/user");
const admin = require("./routes/admin");

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(cookieParser()); // Use cookie-parser to handle cookies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
const store = new mongoDbStore({
    uri: process.env.MONGO_URI, // Pass the MongoDB Atlas URI directly
    collection: 'sessions', // Name of the session collection in MongoDB
});

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 * 24 },
    store: store
}));

// app.use("/", user);
app.use("/admin", admin);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Access the application at http://localhost:${PORT}`);
});
