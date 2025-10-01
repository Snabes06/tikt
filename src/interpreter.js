
// Interpreter for tikt language
export function evaluate(node, env = {}) {
	switch (node.type) {
		case 'Program': {
			let result;
			for (const stmt of node.body) {
				result = evaluate(stmt, env);
			}
			return result;
		}
		case 'BlockStatement': {
			// New scope for block
			const localEnv = Object.create(env);
			let result;
			for (const stmt of node.body) {
				result = evaluate(stmt, localEnv);
			}
			return result;
		}
		case 'VariableDeclaration': {
			env[node.id.name] = evaluate(node.init, env);
			return null;
		}
		case 'ConstantDeclaration': {
			env[node.id.name] = evaluate(node.init, env);
			return null;
		}
		case 'Assignment': {
			if (!(node.id.name in env)) {
				const suggestion = suggestVariable(node.id.name, env);
				throw new Error(`Undefined variable: ${node.id.name}${suggestion}`);
			}
			env[node.id.name] = evaluate(node.value, env);
			return null;
		}
		case 'Identifier': {
			if (!(node.name in env)) {
				const suggestion = suggestVariable(node.name, env);
				throw new Error(`Undefined variable: ${node.name}${suggestion}`);
			}
			return env[node.name];
		}
		case 'NUMBER':
		case 'STRING':
		case 'BOOLEAN':
			return node.value;
		case 'BinaryExpression': {
			const left = evaluate(node.left, env);
			const right = evaluate(node.right, env);
			switch (node.operator) {
				case '+': return left + right;
				case '-': return left - right;
				case '*': return left * right;
				case '/': return left / right;
				case '==': return left === right;
				case '!=': return left !== right;
				case '<': return left < right;
				case '>': return left > right;
				case '<=': return left <= right;
				case '>=': return left >= right;
				default: throw new Error(`Unknown operator: ${node.operator} in BinaryExpression`);
			}
		}
		case 'PrintStatement': {
			const val = evaluate(node.argument, env);
			console.log(val);
			return null;
		}
		case 'IfStatement': {
			if (evaluate(node.test, env)) {
				return evaluate(node.consequent, env);
			} else if (node.alternate) {
				return evaluate(node.alternate, env);
			}
			return null;
		}
		case 'WhileStatement': {
			let loopCount = 0;
			while (evaluate(node.test, env)) {
				evaluate(node.body, env);
				loopCount++;
				if (loopCount > 10000) throw new Error('Possible infinite loop detected.');
			}
			return null;
		}
		case 'ExpressionStatement': {
			return evaluate(node.expression, env);
		}
		default: {
			const nodeType = node && node.type ? node.type : JSON.stringify(node);
			throw new Error(`Unknown AST node type: ${nodeType}`);
		}
	}
}

// Suggest similar variable names for undefined variables
function suggestVariable(name, env) {
	const vars = Object.keys(env);
	if (vars.length === 0) return '';
	let closest = null;
	let minDist = Infinity;
	for (const v of vars) {
		const d = levenshtein(name, v);
		if (d < minDist) {
			minDist = d;
			closest = v;
		}
	}
	if (closest && minDist <= 2) {
		return `. Did you mean '${closest}'?`;
	}
	return '';
}

// Simple Levenshtein distance for suggestions
function levenshtein(a, b) {
	const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
	for (let i = 0; i <= a.length; i++) dp[i][0] = i;
	for (let j = 0; j <= b.length; j++) dp[0][j] = j;
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			if (a[i - 1] === b[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1];
			} else {
				dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
			}
		}
	}
	return dp[a.length][b.length];
}