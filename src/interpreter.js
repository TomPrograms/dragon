const tokenTypes = require("./tokenTypes.js");
const RuntimeError = require("./runtimeError.js");
const Environment = require("./environment.js");

class BreakException extends Error {}
class Return extends Error {
  constructor(value) {
    super(value);
    this.value = value;
  }
}

class Callable {
  arity() {
    return this.arityValue;
  }
}

class StandardFn extends Callable {
  constructor(arityValue, func) {
    super();
    this.arityValue = arityValue;
    this.func = func;
  }

  call(interpreter, args, token) {
    this.token = token;
    return this.func.apply(this, args);
  }
}

class DragonFunction extends Callable {
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
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.defineVar(this.declaration.params[i].lexeme, args[i]);
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

class DragonInstance {
  constructor(creatorClass) {
    this.creatorClass = creatorClass;
    this.fields = {};
  }

  get(name) {
    if (this.fields.hasOwnProperty(name.lexeme)) {
      return this.fields[name.lexeme];
    }

    let method = this.creatorClass.findMethod(name.lexeme);
    if (method) return method.bind(this);

    throw new RuntimeError(name, "Couldn't get undefined property.");
  }

  set(name, value) {
    this.fields[name.lexeme] = value;
  }

  toString() {
    return "<" + this.creatorClass.name + " instance>";
  }
}

class DragonClass extends Callable {
  constructor(name, superclass, methods) {
    super();
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  findMethod(name) {
    if (this.methods.hasOwnProperty(name)) {
      return this.methods[name];
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
    }

    return undefined;
  }

  toString() {
    return this.name;
  }

  arity() {
    let initializer = this.findMethod("init");
    return initializer ? initializer.arity() : 0;
  }

  call(interpreter, args) {
    let instance = new DragonInstance(this);

    let initializer = this.findMethod("init");
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }
}

module.exports = class Interpreter {
  constructor(Dragon) {
    this.Dragon = Dragon;
    this.globals = new Environment();
    this.environment = this.globals;
    this.locals = new Map();

    this.globals.defineVar(
      "clock",
      new StandardFn(0, function() {
        return Date.now() / 1000;
      })
    );

    this.globals.defineVar(
      "len",
      new StandardFn(1, function(obj) {
        return obj.length;
      })
    );

    this.globals.defineVar(
      "str",
      new StandardFn(1, function(value) {
        return `${value}`;
      })
    );

    this.globals.defineVar(
      "float",
      new StandardFn(1, function(value) {
        if (!/^-{0,1}\d+$/.test(value) && !/^\d+\.\d+$/.test(value))
          throw new RuntimeError(
            this.token,
            "Only numbers can be parsed to floats."
          );
        return parseFloat(value);
      })
    );

    this.globals.defineVar(
      "int",
      new StandardFn(1, function(value) {
        if (!/^-{0,1}\d+$/.test(value) && !/^\d+\.\d+$/.test(value))
          throw new RuntimeError(
            this.token,
            "Only numbers can be parsed to integers."
          );
        return parseInt(value);
      })
    );
  }

  resolve(expr, depth) {
    this.locals.set(expr, depth);
  }

  visitLiteralExpr(expr) {
    return expr.value;
  }

  evaluate(expr) {
    return expr.accept(this);
  }

  visitGroupingExpr(expr) {
    return this.evaluate(expr.expression);
  }

  isTruthy(object) {
    if (object === null) return false;
    else if (typeof object === "boolean") return Boolean(object);
    else return true;
  }

  checkNumberOperand(operator, operand) {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  visitUnaryExpr(expr) {
    let right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case tokenTypes.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
      case tokenTypes.BANG:
        return !this.isTruthy(right);
    }

    return null;
  }

  isEqual(left, right) {
    if (left === null && right === null) return true;
    else if (left === null) return false;

    return left === right;
  }

  checkNumberOperands(operator, left, right) {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  visitBinaryExpr(expr) {
    let left = this.evaluate(expr.left);
    let right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case tokenTypes.STAR_STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Math.pow(left, right);

      case tokenTypes.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);

      case tokenTypes.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);

      case tokenTypes.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);

      case tokenTypes.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);

      case tokenTypes.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);

      case tokenTypes.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return Number(left) + Number(right);
        }

        if (typeof left === "string" && typeof right === "string") {
          return String(left) + String(right);
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );

      case tokenTypes.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);

      case tokenTypes.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);

      case tokenTypes.MODULUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) % Number(right);

      case tokenTypes.BANG_EQUAL:
        return !this.isEqual(left, right);

      case tokenTypes.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    return null;
  }

  visitCallExpr(expr) {
    let callee = this.evaluate(expr.callee);

    let args = [];
    for (let i = 0; i < expr.args.length; i++) {
      args.push(this.evaluate(expr.args[i]));
    }

    if (!(callee instanceof Callable)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes."
      );
    }

    if (args.length !== callee.arity()) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${callee.arity()} arguments but got ${args.length} arguments.`
      );
    }

    if (callee instanceof StandardFn) {
      return callee.call(this, args, expr.callee.name);
    }

    return callee.call(this, args);
  }

  visitAssignExpr(expr) {
    let value = this.evaluate(expr.value);

    let distance = this.locals.get(expr);
    if (distance !== undefined) {
      this.environment.assignVarAt(distance, expr.name, value);
    } else {
      this.environment.assignVar(expr.name, value);
    }

    return value;
  }

  lookupVar(name, expr) {
    let distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getVarAt(distance, name.lexeme);
    } else {
      return this.globals.getVar(name);
    }
  }

  visitVariableExpr(expr) {
    return this.lookupVar(expr.name, expr);
  }

  visitExpressionStmt(stmt) {
    this.evaluate(stmt.expression);
    return null;
  }

  visitLogicalExpr(expr) {
    let left = this.evaluate(expr.left);

    // if OR token
    if (expr.operator.type == tokenTypes.OR) {
      // if one statement true, must return true value
      if (this.isTruthy(left)) return left;
    }

    // if AND token
    else {
      // if one statement not true, must return false value
      if (!this.isTruthy(left)) return left;
    }

    // if no shortcut, this statement must be equal truthy to overall expression value
    return this.evaluate(expr.right);
  }

  visitIfStmt(stmt) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }

    return null;
  }

  visitWhileStmt(stmt) {
    try {
      while (this.isTruthy(this.evaluate(stmt.condition))) {
        this.execute(stmt.body);
      }
    } catch (error) {
      if (error instanceof BreakException) {
      } else {
        throw error;
      }
    }

    return null;
  }

  visitPrintStmt(stmt) {
    let value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  executeBlock(statements, environment) {
    let previous = this.environment;
    try {
      this.environment = environment;

      for (let i = 0; i < statements.length; i++) {
        this.execute(statements[i]);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitBlockStmt(stmt) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return null;
  }

  visitVarStmt(stmt) {
    let value = null;
    if (stmt.initializer !== undefined) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.defineVar(stmt.name.lexeme, value);
    return null;
  }

  visitBreakStmt(stmt) {
    throw new BreakException();
  }

  visitReturnStmt(stmt) {
    let value = null;
    if (stmt.value != null) value = this.evaluate(stmt.value);

    throw new Return(value);
  }

  visitFunctionExpr(expr) {
    return new DragonFunction(null, expr, this.environment, false);
  }

  visitAssignsubscriptExpr(expr) {
    let obj = this.evaluate(expr.obj);
    let index = this.evaluate(expr.index);
    let value = this.evaluate(expr.value);

    if (Array.isArray(obj)) {
      if (index < 0 && obj.length !== 0) {
        while (index < 0) {
          index += obj.length;
        }
      }
    }

    obj[index] = value;
  }

  visitSubscriptExpr(expr) {
    let obj = this.evaluate(expr.callee);
    if (!Array.isArray(obj) && obj.constructor !== Object)
      throw new RuntimeError(
        expr.callee.name,
        "Only arrays and dictionaries can be subscripted."
      );

    let index = this.evaluate(expr.index);
    if (Array.isArray(obj)) {
      if (!Number.isInteger(index)) {
        throw new RuntimeError(
          expr.closeBracket,
          "Only numbers can be used to index an array."
        );
      }

      if (index >= obj.length) {
        throw new RuntimeError(expr.closeBracket, "Array index out of range.");
      }
      return obj[index];
    } else if (obj.constructor == Object) {
      return obj[index];
    }
  }

  visitSetExpr(expr) {
    let obj = this.evaluate(expr.object);

    if (!(obj instanceof DragonInstance) && obj.constructor !== Object) {
      throw new RuntimeError(
        expr.object.name,
        "Only instances and dictionaries can have fields set."
      );
    }

    let value = this.evaluate(expr.value);
    if (obj instanceof DragonInstance) {
      obj.set(expr.name, value);
      return value;
    } else if (obj.constructor == Object) {
      obj[expr.name] = value;
    }
  }

  visitFunctionStmt(stmt) {
    let func = new DragonFunction(
      stmt.name.lexeme,
      stmt.func,
      this.environment,
      false
    );
    this.environment.defineVar(stmt.name.lexeme, func);
  }

  visitClassStmt(stmt) {
    let superclass = null;
    if (stmt.superclass !== null) {
      superclass = this.evaluate(stmt.superclass);
      if (!(superclass instanceof DragonClass)) {
        throw new RuntimeError(
          stmt.superclass.name,
          "Superclass must be a class."
        );
      }
    }

    this.environment.defineVar(stmt.name.lexeme, null);

    if (stmt.superclass !== null) {
      this.environment = new Environment(this.environment);
      this.environment.defineVar("super", superclass);
    }

    let methods = {};
    let definedMethods = stmt.methods;
    for (let i = 0; i < stmt.methods.length; i++) {
      let currentMethod = definedMethods[i];
      let isInitializer = currentMethod.name.lexeme === "init";
      let func = new DragonFunction(
        currentMethod.name.lexeme,
        currentMethod.func,
        this.environment,
        isInitializer
      );
      methods[currentMethod.name.lexeme] = func;
    }

    let created = new DragonClass(stmt.name.lexeme, superclass, methods);

    if (superclass !== null) {
      this.environment = this.environment.enclosing;
    }

    this.environment.assignVar(stmt.name, created);
    return null;
  }

  visitGetExpr(expr) {
    let object = this.evaluate(expr.object);
    if (object instanceof DragonInstance) {
      return object.get(expr.name);
    } else if (object.constructor == Object) {
      return object[expr.name];
    }

    throw new RuntimeError(
      expr.name,
      "You can only access the properies of instances and dictionaries."
    );
  }

  visitThisExpr(expr) {
    return this.lookupVar(expr.keyword, expr);
  }

  visitDictionaryExpr(expr) {
    let dict = {};
    for (let i = 0; i < expr.keys.length; i++) {
      dict[this.evaluate(expr.keys[i])] = this.evaluate(expr.values[i]);
    }
    return dict;
  }

  visitArrayExpr(expr) {
    let values = [];
    for (let i = 0; i < expr.values.length; i++) {
      values.push(this.evaluate(expr.values[i]));
    }
    return values;
  }

  visitSuperExpr(expr) {
    let distance = this.locals.get(expr);
    let superclass = this.environment.getVarAt(distance, "super");

    let object = this.environment.getVarAt(distance - 1, "this");

    let method = superclass.findMethod(expr.method.lexeme);

    if (method === undefined) {
      throw new RuntimeError(expr, "Undefined property called by super.");
    }

    return method.bind(object);
  }

  stringify(object) {
    if (object === null) return "nil";
    if (Array.isArray(object)) return object;

    return object.toString();
  }

  execute(stmt) {
    stmt.accept(this);
  }

  interpret(statements) {
    try {
      for (let i = 0; i < statements.length; i++) {
        this.execute(statements[i]);
      }
    } catch (error) {
      this.Dragon.runtimeError(error);
    }
  }
};
