const express = require('express');
const pool = require('../db');
const { isValidBook } = require('../validation');

const router = express.Router();

// GET /api/books - list all books
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id - fetch a single book
// Parameterized query: the driver sends `id` as a separate bind value,
// so user input is never concatenated into the SQL string (no SQLi possible).
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

    // --- INSECURE EXAMPLE (for SAST/DAST demo only, keep disabled) ---
    // String-concatenated query lets an attacker inject SQL via `id`,
    // e.g. id = "1 OR 1=1" or "1; DROP TABLE books;--"
    // const result = await pool.query(`SELECT * FROM books WHERE id = ${id}`);
    // -------------------------------------------------------------------

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/books - create a book
// Parameterized insert: values are bound as $1..$4, never interpolated into SQL.
router.post('/', async (req, res, next) => {
  const { title, author, isbn, published_year } = req.body;
  if (!isValidBook(req.body)) {
    return res.status(400).json({ error: 'title and author are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO books (title, author, isbn, published_year) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, author, isbn || null, published_year || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
