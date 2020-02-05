const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
const Interpreter = require("./interpreter.js");
const tokenTypes = require("./tokenTypes.js");
const fs = require("fs");

class Dragon {
  constructor() {
    this.hadError = false;
    this.hadRuntimeError = false;
  }

  runfile(filename) {
    const fileData = fs.readFileSync(filename).toString();
    this.run(fileData);

    if (this.hadError) process.exit(65);
    if (this.hadRuntimeError) process.exit(70);
  }

  run(code) {
    const lexer = new Lexer(code, this);
    const tokens = lexer.scan();

    const parser = new Parser(tokens, this);
    const statements = parser.parse();

    if (this.hadError === true) return;

    let interpreter = new Interpreter(this);
    interpreter.interpret(statements);
  }

  report(line, where, message) {
    console.error(`[Line: ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }

  error(token, errorMessage) {
    if (token.type === tokenTypes.EOF) {
      this.report(token.line, "at end", errorMessage);
    } else {
      this.report(token.line, " at '" + token.lexeme + "'", errorMessage);
    }
  }

  throw(line, error) {
    throw new Error(`Line ${ line }. ${error}`);
  }

  runtimeError(error) {
    if (error.token && error.token.line) {
      console.error(`Error: [Line: ${error.token.line}] ${error.message}`);
    } else {
      console.error(error);
    }
    this.hadRuntimeError = true;
  }
}

module.exports = Dragon;
