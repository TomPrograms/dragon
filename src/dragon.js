const Scanner = require("./scanner.js");
const Parser = require("./parser.js");
const tokenTypes = require("./tokenTypes.js")

class Dragon {
  constructor() {
    this.hadError = false;
  }

  run(code) {
    const scanner = new Scanner(code, this);
    const tokens = scanner.scan();

    const parser = new Parser(tokens, this);
    const expression = parser.parse();

    if (this.hadError === true) return;


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
    throw new Error(line + " " + error);
  }
}

module.exports = Dragon;
