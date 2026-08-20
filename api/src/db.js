const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.PGHOST || 'db',
  user: process.env.PGUSER || 'appuser',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'booksdb',
  port: Number(process.env.PGPORT) || 5432,
});
module.exports = pool;