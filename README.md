# Tikt


This is a JavaScript-interpreted toy programming language with tiktok brainrot.


## Usage


Run a program:
```bash
npm start examples/hello.lang
```


Run the interactive REPL:
```bash
npm run repl
```


## Project Structure
- src/lexer.js - tokenizes input
- src/parser.js - parses tokens to AST
- src/interpreter.js - evaluates AST
- src/index.js - program entry point
- src/repl.js - interactive shell
- examples/ - sample programs
- tests/ - unit tests
- docs/ - documentation
