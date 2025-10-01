
// Helper functions
function expect(tokens, type, value) {
	const token = tokens.shift();
	if (!token || token.type !== type || (value && token.value !== value)) {
		const where = token && token.line !== undefined ? ` at line ${token.line}, col ${token.col}` : '';
		throw new Error(`Expected ${type} ${value || ''}${where}`);
	}
	return token;
}

function peek(tokens) {
	return tokens[0];
}

// Expression parser (handles numbers, identifiers, binary ops)
function parseExpression(tokens) {
	let left = parsePrimary(tokens);
	while (peek(tokens) && peek(tokens).type === 'OPERATOR' && ['+', '-', '*', '/', 'nocap', 'cap', '<', '>', '<=', '>='].includes(peek(tokens).value)) {
		const op = tokens.shift().value;
		const right = parsePrimary(tokens);
		left = { type: 'BinaryExpression', operator: op, left, right };
	}
	return left;
}

function parsePrimary(tokens) {
	const token = tokens.shift();
	if (!token) throw new Error('Unexpected end of input');
	if (token.type === 'NUMBER') return { type: 'NUMBER', value: token.value };
	if (token.type === 'STRING') return { type: 'STRING', value: token.value };
	if (token.type === 'IDENTIFIER') return { type: 'Identifier', name: token.value };
	if (token.type === 'KEYWORD' && (token.value === 'based' || token.value === 'cringe')) return { type: 'BOOLEAN', value: token.value === 'based' };
	if (token.type === 'PUNCTUATION' && token.value === '(') {
		const expr = parseExpression(tokens);
		expect(tokens, 'PUNCTUATION', ')');
		return expr;
	}
	const where = token.line !== undefined ? ` at line ${token.line}, col ${token.col}` : '';
	throw new Error(`Unexpected token: ${token.type} ${token.value}${where}`);
}

// Statement parser
function parseStatement(tokens) {
	const token = peek(tokens);
	if (!token) return null;

	// Variable declaration: let x = expr;
	if (token.type === 'KEYWORD' && token.value === 'gyatt') {
		tokens.shift();
        const id = expect(tokens, 'IDENTIFIER');
		expect(tokens, 'OPERATOR', '=');
		const expr = parseExpression(tokens);
		expect(tokens, 'PUNCTUATION', ';');
		return { type: 'VariableDeclaration', id: { type: 'Identifier', name: id.value }, init: expr };
	}

    // Variable declaration: const x = expr;
	if (token.type === 'KEYWORD' && token.value === 'fr') {
		tokens.shift();
        const id = expect(tokens, 'IDENTIFIER');
		expect(tokens, 'OPERATOR', '=');
		const expr = parseExpression(tokens);
		expect(tokens, 'PUNCTUATION', ';');
		return { type: 'ConstantDeclaration', id: { type: 'Identifier', name: id.value }, init: expr };
	}

	// Assignment: x = expr;
	if (token.type === 'IDENTIFIER') {
		const id = tokens.shift();
		if (peek(tokens) && peek(tokens).type === 'OPERATOR' && peek(tokens).value === '=') {
			tokens.shift();
			const expr = parseExpression(tokens);
			expect(tokens, 'PUNCTUATION', ';');
			return { type: 'Assignment', id: { type: 'Identifier', name: id.value }, value: expr };
		}
		throw new Error('Invalid assignment syntax');
	}

	// Print statement: print(expr);
	if (token.type === 'KEYWORD' && token.value === 'yap') {
		tokens.shift();
		expect(tokens, 'PUNCTUATION', '(');
		const expr = parseExpression(tokens);
		expect(tokens, 'PUNCTUATION', ')');
		expect(tokens, 'PUNCTUATION', ';');
		return { type: 'PrintStatement', argument: expr };
	}

	// If statement: if (cond) { ... } [else { ... }]
	if (token.type === 'KEYWORD' && token.value === 'ong') {
		tokens.shift();
		expect(tokens, 'PUNCTUATION', '(');
		const test = parseExpression(tokens);
		expect(tokens, 'PUNCTUATION', ')');
		expect(tokens, 'PUNCTUATION', '{');
		const consequent = parseBlock(tokens);
		let alternate = null;
		if (peek(tokens) && peek(tokens).type === 'KEYWORD' && peek(tokens).value === 'nah') {
			tokens.shift();
			expect(tokens, 'PUNCTUATION', '{');
			alternate = parseBlock(tokens);
		}
		return { type: 'IfStatement', test, consequent, alternate };
	}

	// While statement: while (cond) { ... }
	if (token.type === 'KEYWORD' && token.value === 'fentfold') {
		tokens.shift();
		expect(tokens, 'PUNCTUATION', '(');
		const test = parseExpression(tokens);
		expect(tokens, 'PUNCTUATION', ')');
		expect(tokens, 'PUNCTUATION', '{');
		const body = parseBlock(tokens);
		return { type: 'WhileStatement', test, body };
	}

	// Expression statement: expr;
	const expr = parseExpression(tokens);
	expect(tokens, 'PUNCTUATION', ';');
	return { type: 'ExpressionStatement', expression: expr };
}

function parseBlock(tokens) {
	const body = [];
	while (peek(tokens) && !(peek(tokens).type === 'PUNCTUATION' && peek(tokens).value === '}')) {
		const stmt = parseStatement(tokens);
		if (stmt) body.push(stmt);
	}
	expect(tokens, 'PUNCTUATION', '}');
	return { type: 'BlockStatement', body };
}

export function parse(tokens) {
	// Parse a sequence of statements (program)
	const body = [];
	while (tokens.length > 0) {
		const stmt = parseStatement(tokens);
		if (stmt) body.push(stmt);
	}
	return { type: 'Program', body };
}