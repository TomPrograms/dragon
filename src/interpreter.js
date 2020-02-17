const tokenTypes = require("./tokenTypes.js");
const Environment = require("./environment.js");
const Dragon = require("./dragon.js");
const loadGlobalLib = require("./lib/globalLib.js");
const path = require("path");
const fs = require("fs");
const checkStdLib = require("./lib/importStdlib.js");

const Callable = require("./structures/callable.js");
const StandardFn = require("./structures/standardFn.js");
const DragonClass = require("./structures/class.js");
const DragonFunction = require("./structures/function.js");
const DragonInstance = require("./structures/instance.js");
const DragonModule = require("./structures/module.js");

const {
  RuntimeError,
  ContinueException,
  BreakException,
  ReturnException
} = require("./errors.js");

module.exports = class Interpreter {
  constructor(Dragon, baseDir) {
    this.Dragon = Dragon;
    this.baseDir = baseDir;

    this.globals = new Environment();
    this.environment = this.globals;
    this.locals = new Map();

    this.globals = loadGlobalLib(this.globals);
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

      case tokenTypes.BIT_AND:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) & Number(right);

      case tokenTypes.BIT_XOR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) ^ Number(right);

      case tokenTypes.BIT_OR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) | Number(right);

      case tokenTypes.LESSER_LESSER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) << Number(right);

      case tokenTypes.GREATER_GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >> Number(right);

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

    let params;
    if (callee instanceof DragonFunction) {
      params = callee.declaration.params;
    } else if (callee instanceof DragonClass) {
      params = callee.methods.init
        ? callee.methods.init.declaration.params
        : [];
    } else {
      params = [];
    }

    // if not enough params provided, default to null
    if (args.length < callee.arity()) {
      let diff = callee.arity() - args.length;
      for (let i = 0; i < diff; i++) {
        args.push(null);
      }
    }

    // if too many params, ignore them or assign them to wildcard
    else if (args.length >= callee.arity()) {
      // if wildcard then assign rest of arguments to wildcard
      if (
        params.length > 0 &&
        params[params.length - 1]["type"] === "wildcard"
      ) {
        let newArgs = args.slice(0, params.length - 1);
        newArgs.push(args.slice(params.length - 1, args.length));
        args = newArgs;
      }
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
      return null;
    }

    for (let i = 0; i < stmt.elifBranches.length; i++) {
      let current = stmt.elifBranches[i];

      if (this.isTruthy(this.evaluate(current.condition))) {
        this.execute(current.branch);
        return null;
      }
    }

    if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }

    return null;
  }

  visitForStmt(stmt) {
    if (stmt.initializer !== null) {
      this.evaluate(stmt.initializer);
    }
    while (true) {
      if (stmt.condition !== null) {
        if (!this.isTruthy(this.evaluate(stmt.condition))) {
          break;
        }
      }

      try {
        this.execute(stmt.body);
      } catch (error) {
        if (error instanceof BreakException) {
          break;
        } else if (error instanceof ContinueException) {
          // do nothing and continue the loop
        } else {
          throw error;
        }
      }

      if (stmt.increment !== null) {
        this.evaluate(stmt.increment);
      }
    }
    return null;
  }

  visitDoStmt(stmt) {
    do {
      try {
        this.execute(stmt.doBranch);
      } catch (error) {
        if (error instanceof BreakException) {
          break;
        } else if (error instanceof ContinueException) {
          // do nothing and continue the loop
        } else {
          throw error;
        }
      }
    } while (this.isTruthy(this.evaluate(stmt.whileCondition)));
  }

  visitSwitchStmt(stmt) {
    let switchCondition = this.evaluate(stmt.condition);
    let branches = stmt.branches;
    let defaultBranch = stmt.defaultBranch;

    let matched = false;
    try {
      for (let i = 0; i < branches.length; i++) {
        let branch = branches[i];

        for (let j = 0; j < branch.conditions.length; j++) {
          if (this.evaluate(branch.conditions[j]) === switchCondition) {
            matched = true;

            try {
              for (let k = 0; k < branch.stmts.length; k++) {
                this.execute(branch.stmts[k]);
              }
            } catch (error) {
              if (error instanceof ContinueException) {
                // do nothing to continue switch statement
              } else {
                throw error;
              }
            }
          }
        }
      }

      if (defaultBranch !== null && matched === false) {
        for (let i = 0; i < defaultBranch.stmts.length; i++) {
          this.execute(defaultBranch["stmts"][i]);
        }
      }
    } catch (error) {
      if (error instanceof BreakException) {
        // do nothing but stop switch exception
      } else {
        throw error;
      }
    }
  }

  visitTryStmt(stmt) {
    try {
      let successful = true;
      try {
        this.executeBlock(stmt.tryBranch, new Environment(this.environment));
      } catch (error) {
        successful = false;

        if (stmt.catchBranch !== null) {
          this.executeBlock(
            stmt.catchBranch,
            new Environment(this.environment)
          );
        }
      }

      if (successful && stmt.elseBranch !== null) {
        this.executeBlock(stmt.elseBranch, new Environment(this.environment));
      }
    } finally {
      if (stmt.finallyBranch !== null)
        this.executeBlock(
          stmt.finallyBranch,
          new Environment(this.environment)
        );
    }
  }

  visitWhileStmt(stmt) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      try {
        this.execute(stmt.body);
      } catch (error) {
        if (error instanceof BreakException) {
          break;
        } else if (error instanceof ContinueException) {
          // do nothing and continue the loop
        } else {
          throw error;
        }
      }
    }

    return null;
  }

  visitImportStmt(stmt) {
    let relativePath = this.evaluate(stmt.path);
    let totalPath = path.join(this.baseDir, relativePath);
    let totalFolder = path.dirname(totalPath);
    let filename = path.basename(totalPath);

    let data = checkStdLib(relativePath);
    if (data !== null) return data;

    if (!fs.existsSync(totalPath)) {
      throw new RuntimeError(stmt.closeBracket, "Couldn't find imported file.");
    }

    data = fs.readFileSync(totalPath).toString();

    const dragon = new Dragon.Dragon(filename);
    const interpreter = new Interpreter(dragon, totalFolder);

    dragon.run(data, interpreter);

    let exported = interpreter.globals.values.exports;

    const isDict = obj => obj.constructor === Object;

    if (isDict(exported)) {
      let newModule = new DragonModule();

      let keys = Object.keys(exported);
      for (let i = 0; i < keys.length; i++) {
        newModule[keys[i]] = exported[keys[i]];
      }

      return newModule;
    }

    return exported;
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
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.defineVar(stmt.name.lexeme, value);
    return null;
  }

  visitContinueStmt(stmt) {
    throw new ContinueException();
  }

  visitBreakStmt(stmt) {
    throw new BreakException();
  }

  visitReturnStmt(stmt) {
    let value = null;
    if (stmt.value != null) value = this.evaluate(stmt.value);

    throw new ReturnException(value);
  }

  visitFunctionExpr(expr) {
    return new DragonFunction(null, expr, this.environment, false);
  }

  visitAssignsubscriptExpr(expr) {
    let obj = this.evaluate(expr.obj);
    let index = this.evaluate(expr.index);
    let value = this.evaluate(expr.value);

    if (Array.isArray(obj)) {
      // convert minus indexes to relevant positive number
      if (index < 0 && obj.length !== 0) {
        while (index < 0) {
          index += obj.length;
        }
      }

      // pad array with null instead of creating empty items
      while (obj.length < index) {
        obj.push(null);
      }

      obj[index] = value;
    } else if (
      obj.constructor == Object ||
      obj instanceof DragonInstance ||
      obj instanceof DragonFunction ||
      obj instanceof DragonClass ||
      obj instanceof DragonModule
    ) {
      obj[index] = value;
    }

    // value doesn't support subscript assignment
    else {
      throw new RuntimeError(
        expr.obj.name,
        "Only arrays, dictionaries, classes and instances can be mutated by a subscript."
      );
    }
  }

  visitSubscriptExpr(expr) {
    let obj = this.evaluate(expr.callee);

    let index = this.evaluate(expr.index);
    if (Array.isArray(obj)) {
      if (!Number.isInteger(index)) {
        throw new RuntimeError(
          expr.closeBracket,
          "Only integers can be used to index an array."
        );
      }

      // convert minus indexes to relevant positive number
      if (index < 0 && obj.length !== 0) {
        while (index < 0) {
          index += obj.length;
        }
      }

      if (index >= obj.length) {
        throw new RuntimeError(expr.closeBracket, "Array index out of range.");
      }
      return obj[index];
    }

    // other data types
    else if (
      obj.constructor == Object ||
      obj instanceof DragonInstance ||
      obj instanceof DragonFunction ||
      obj instanceof DragonClass ||
      obj instanceof DragonModule
    ) {
      return obj[index] || null;
    }

    // strings
    else if (typeof obj === "string") {
      // convert minus indexes to relevant positive number
      if (!Number.isInteger(index)) {
        throw new RuntimeError(
          expr.closeBracket,
          "Only integers can be used to index an array."
        );
      }

      if (index < 0 && obj.length !== 0) {
        while (index < 0) {
          index += obj.length;
        }
      }

      if (index >= obj.length) {
        throw new RuntimeError(expr.closeBracket, "String index out of range.");
      }
      return obj.charAt(index);
    }

    // value doesn't support subscripting
    else {
      throw new RuntimeError(
        expr.callee.name,
        "Only arrays, strings, dictionaries, classes and instances can be subscripted."
      );
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
      obj[expr.name.lexeme] = value;
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
      return object.get(expr.name) || null;
    } else if (object.constructor == Object) {
      return object[expr.name.lexeme] || null;
    } else if (object instanceof DragonModule) {
      return object[expr.name.lexeme] || null;
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
      throw new RuntimeError(
        expr.method,
        "Undefined property called by super."
      );
    }

    return method.bind(object);
  }

  stringify(object) {
    if (object === null) return "null";
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
