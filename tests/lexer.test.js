import assert from "assert";
import { tokenize } from "../src/lexer.js";

assert.deepStrictEqual(tokenize("5 + 3"), [
  { type: "NUMBER", value: 5 },
  { type: "OPERATOR", value: "+" },
  { type: "NUMBER", value: 3 }
]);