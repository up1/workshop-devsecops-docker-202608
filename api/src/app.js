const express = require('express');
const helmet = require('helmet');
const books = require('./routes/books');

const app = express();
app.use(helmet());              // sets secure HTTP headers
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/books', books);
module.exports = app;