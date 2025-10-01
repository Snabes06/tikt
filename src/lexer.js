// tikt language lexer
const OPERATOR_WORDS = ['nocap', 'cap'];
const KEYWORDS = [
    'gyatt', 'fr', 'huzz', 'ong', 'nah', 'fentfold', 'bet', 'based', 'cringe', 'yap'
];

export function tokenize(input) {
    const tokens = [];
    let i = 0;
    let line = 1;
    let col = 1;
    while (i < input.length) {
        let char = input[i];

        // Skip whitespace (track newlines) 
        if (/\s/.test(char)) {
            if (char === '\n') {
                line++;
                col = 1;
            } else {
                col++;
            }
            i++;
            continue;
        }

        // Numbers
        if (/[0-9]/.test(char)) {
            let num = '';
            let startCol = col;
            while (/[0-9]/.test(input[i])) {
                num += input[i++];
                col++;
            }
            tokens.push({ type: 'NUMBER', value: Number(num), line, col: startCol });
            continue;
        }

        // Identifiers, keywords, or operator words
        if (/[a-zA-Z_]/.test(char)) {
            let ident = '';
            let startCol = col;
            while (/[a-zA-Z0-9_]/.test(input[i])) {
                ident += input[i++];
                col++;
            }
            if (OPERATOR_WORDS.includes(ident)) {
                tokens.push({ type: 'OPERATOR', value: ident, line, col: startCol });
            } else if (KEYWORDS.includes(ident)) {
                tokens.push({ type: 'KEYWORD', value: ident, line, col: startCol });
            } else {
                tokens.push({ type: 'IDENTIFIER', value: ident, line, col: startCol });
            }
            continue;
        }

        // Strings
        if (char === '"') {
            let startCol = col;
            i++; col++;
            let str = '';
            while (i < input.length && input[i] !== '"') {
                if (input[i] === '\\' && input[i+1] === '"') {
                    str += '"';
                    i += 2; col += 2;
                } else {
                    str += input[i++];
                    col++;
                }
            }
            if (input[i] !== '"') {
                throw new Error(`Unterminated string at line ${line}, col ${startCol}`);
            }
            i++; col++;
            tokens.push({ type: 'STRING', value: str, line, col: startCol });
            continue;
        }

        // Operators (multi-char first)
        const twoCharOps = ['<=', '>='];
        const oneCharOps = ['+', '-', '*', '/', '=', '<', '>', '(', ')', '{', '}', ';', ',',];
        let two = input.slice(i, i+2);
        if (twoCharOps.includes(two)) {
            tokens.push({ type: 'OPERATOR', value: two, line, col });
            i += 2; col += 2;
            continue;
        }
        if (oneCharOps.includes(char)) {
            let type = 'OPERATOR';
            if ('(){};,'.includes(char)) type = 'PUNCTUATION';
            tokens.push({ type, value: char, line, col });
            i++; col++;
            continue;
        }

        // Unknown character
        throw new Error(`Unknown character: ${char} at line ${line}, col ${col}`);
    }
    return tokens;
}