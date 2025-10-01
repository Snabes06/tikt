
import readline from 'readline';
import { tokenize } from './lexer.js';
import { parse } from './parser.js';
import { evaluate } from './interpreter.js';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'tikt> '
});

let buffer = '';
let env = {};

function isInputComplete(input) {
	// Simple check: count braces
	let open = 0, close = 0;
	for (const c of input) {
		if (c === '{') open++;
		if (c === '}') close++;
	}
	return open === close;
}

function handleInput(line) {
	buffer += line + '\n';
	if (!isInputComplete(buffer)) {
		rl.setPrompt('... ');
		rl.prompt();
		return;
	}
	try {
		const tokens = tokenize(buffer);
		const ast = parse(tokens);
		const result = evaluate(ast, env);
		if (result !== undefined && result !== null) {
			console.log(result);
		}
	} catch (err) {
		console.error('Error:', err.message);
	}
	buffer = '';
	rl.setPrompt('tikt> ');
	rl.prompt();
}

console.log('Welcome to the tikt REPL! Type your code below.');
rl.prompt();
rl.on('line', handleInput);