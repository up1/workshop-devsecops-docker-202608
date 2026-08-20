CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  published_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO books (title, author, isbn, published_year) VALUES
  ('Clean Code', 'Robert C. Martin', '9780132350884', 2008),
  ('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', '9780135957059', 2019),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 2017)
ON CONFLICT (isbn) DO NOTHING;
