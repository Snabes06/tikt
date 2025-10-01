import fs from 'fs';
import { tokenize } from './lexer.js';
import { parse } from './parser.js';
import { evaluate } from './interpreter.js';


const filename = process.argv[2];
if (!filename) {
console.error('Usage: npm start <filename>');
process.exit(1);
}

const code = fs.readFileSync(filename, 'utf-8');
const tokens = tokenize(code);
const ast = parse(tokens);
evaluate(ast);