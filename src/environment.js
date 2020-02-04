const RuntimeError = require("./runtimeError.js");

module.exports = class Environment {
  constructor() {
    this.values = {};
  }

  defineVar(varName, value) {
    this.values[varName] = value;
  }

  assignVar(name, values) {
    if (this.values[name.lexeme] !== undefined) {
      this.values[name.lexeme] = value;
      return;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }

  getVar(token) {
    if (this.values[token.lexeme] !== undefined) {
      return this.values[token.lexeme];
    }

    throw new RuntimeError(token, "Undefined variable '" + token.lexeme + "'.");
  }
};
