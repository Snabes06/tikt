import readline from "readline";
import { tokenize } from "./lexer.js";
import { parse } from "./parser.js";
import { evaluate } from "./interpreter.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "my-lang> "
});

rl.prompt();
rl.on("line", (line) => {
  try {
    const tokens = tokenize(line);
    const ast = parse(tokens);
    const result = evaluate(ast);
    console.log(result);
  } catch (err) {
    console.error("Error:", err.message);
  }
  rl.prompt();
});