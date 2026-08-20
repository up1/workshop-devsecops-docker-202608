const { isValidBook } = require("../../src/validation");
test("rejects a book with no title", () => {
  expect(isValidBook({ author: "X" })).toBe(false);
});
test("accepts a valid book", () => {
  expect(isValidBook({ title: "Dune", author: "Herbert" })).toBe(true);
});