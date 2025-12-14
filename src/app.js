const dotenv = require("dotenv")
const express = require('express');
const path = require('path');

dotenv.config();

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static('public'));

// Body parsing (for forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/uploads', express.static(process.env.UPLOAD_DIR)); // this is the key

app.use('/', require('./routes')); // Mount routes

module.exports = app;
