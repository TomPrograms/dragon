const Callable = require("./callable.js");

module.exports = class DragonFunction extends Callable {
  constructor(name, declaration, closure, isInitializer = false) {
    super();
    this.name = name;
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }

  arity() {
    return this.declaration.params.length;
  }

  toString() {
    if (this.name === null) return "<fn>";
    return `<function ${this.name}>`;
  }

  call(interpreter, args) {
    let environment = new Environment(this.closure);
    let params = this.declaration.params;
    for (let i = 0; i < params.length; i++) {
      let param = params[i];

      let name = param["name"].lexeme;
      let value = args[i];
      if (args[i] === null) {
        value = param["default"] ? param["default"].value : null;
      }
      environment.defineVar(name, value);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (error) {
      if (error instanceof Return) {
        if (this.isInitializer) return this.closure.getVarAt(0, "this");
        return error.value;
      } else {
        throw error;
      }
    }

    if (this.isInitializer) return this.closure.getVarAt(0, "this");
    return null;
  }

  bind(instance) {
    let environment = new Environment(this.closure);
    environment.defineVar("this", instance);
    return new DragonFunction(
      this.name,
      this.declaration,
      environment,
      this.isInitializer
    );
  }
}
