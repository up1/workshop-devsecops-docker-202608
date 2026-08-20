function isValidBook(book) {
  if (!book || typeof book !== 'object') return false;
  const { title, author, isbn, published_year } = book;

  if (typeof title !== 'string' || title.trim().length === 0) return false;
  if (typeof author !== 'string' || author.trim().length === 0) return false;
  if (isbn !== undefined && isbn !== null && typeof isbn !== 'string') return false;
  if (
    published_year !== undefined &&
    published_year !== null &&
    (!Number.isInteger(published_year) || published_year < 0 || published_year > new Date().getFullYear())
  ) {
    return false;
  }

  return true;
}

module.exports = { isValidBook };
