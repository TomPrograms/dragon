class ResolverError extends Error {
  constructor(msg) {
    super(msg);
    this.message = msg;
  }
}

class Stack {
  constructor() {
    this.stack = [];
  }

  push(item) {
    this.stack.push(item);
  }

  isEmpty() {
    return this.stack.length === 0;
  }

  peek() {
    if (this.isEmpty()) throw new Error("Stack empty.");
    return this.stack[this.stack.length - 1];
  }

  pop() {
    if (this.isEmpty()) throw new Error("Stack empty.");
    return this.stack.pop();
  }
}

const FunctionType = {
  NONE: "NONE",
  FUNCTION: "FUNCTION",
  INITIALIZER: "INITIALIZER",
  METHOD: "METHOD"
};

const ClassType = {
  NONE: "NONE",
  CLASS: "CLASS",
  SUBCLASS: "SUBCLASS"
};

module.exports = class Resolver {
  constructor(interpreter, dragon) {
    this.interpreter = interpreter;
    this.dragon = dragon;
    this.scopes = new Stack();

    this.currentFunction = FunctionType.NONE;
    this.currentClass = ClassType.NONE;
  }

  define(name) {
    if (this.scopes.isEmpty()) return;
    this.scopes.peek()[name.lexeme] = true;
  }

  declare(name) {
    if (this.scopes.isEmpty()) return;
    let scope = this.scopes.peek();
    if (scope.hasOwnProperty(name.lexeme))
      this.dragon.error(
        name,
        "Variable with this name already declared in this scope."
      );
    scope[name.lexeme] = false;
  }

  beginScope() {
    this.scopes.push({});
  }

  endScope() {
    this.scopes.pop();
  }

  resolve(statements) {
    if (Array.isArray(statements)) {
      for (let i = 0; i < statements.length; i++) {
        statements[i].accept(this);
      }
    } else {
      statements.accept(this);
    }
  }

  resolveLocal(expr, name) {
    for (let i = this.scopes.stack.length - 1; i >= 0; i--) {
      if (this.scopes.stack[i].hasOwnProperty(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.stack.length - 1 - i);
      }
    }
  }

  visitBlockStmt(stmt) {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
    return null;
  }

  visitVariableExpr(expr) {
    if (
      !this.scopes.isEmpty() &&
      this.scopes.peek()[expr.name.lexeme] === false
    ) {
      throw new ResolverError(
        "Cannot read local variable in its own initializer."
      );
    }

    this.resolveLocal(expr, expr.name);
    return null;
  }

  visitVarStmt(stmt) {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  visitAssignExpr(expr) {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
    return null;
  }

  resolveFunction(func, funcType) {
    let enclosingFunc = this.currentFunction;
    this.currentFunction = funcType;

    this.beginScope();
    let params = func.params;
    for (let i = 0; i < params.length; i++) {
      this.declare(params[i]);
      this.define(params[i]);
    }
    this.resolve(func.body);
    this.endScope();

    this.currentFunction = enclosingFunc;
  }

  visitFunctionStmt(stmt) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt.func, FunctionType.FUNCTION);
    return null;
  }

  visitFunctionExpr(stmt) {
    this.resolveFunction(stmt, FunctionType.FUNCTION);
    return null;
  }

  visitClassStmt(stmt) {
    let enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (
      stmt.superclass !== null &&
      stmt.name.lexeme === stmt.superclass.name.lexeme
    ) {
      this.dragon.error("A class cannot inherit from itself.");
    }

    if (stmt.superclass !== null) {
      this.currentClass = ClassType.SUBCLASS;
      this.resolve(stmt.superclass);
    }

    if (stmt.superclass !== null) {
      this.beginScope();
      this.scopes.peek()["super"] = true;
    }

    this.beginScope();
    this.scopes.peek()["this"] = true;

    let methods = stmt.methods;
    for (let i = 0; i < methods.length; i++) {
      let declaration = FunctionType.METHOD;

      if (methods[i].name.lexeme === "init") {
        declaration = FunctionType.INITIALIZER;
      }

      this.resolveFunction(methods[i].func, declaration);
    }

    this.endScope();

    if (stmt.superclass !== null) this.endScope();

    this.currentClass = enclosingClass;
    return null;
  }

  visitSuperExpr(expr) {
    if (this.currentClass === ClassType.NONE) {
      this.dragon.error(expr.keyword, "Cannot use 'super' outside of a class.");
    } else if (this.currentClass !== ClassType.SUBCLASS) {
      this.dragon.error(
        expr.keyword,
        "Cannot use 'super' in a class with no superclass."
      );
    }

    this.resolveLocal(expr, expr.keyword);
    return null;
  }

  visitGetExpr(expr) {
    this.resolve(expr.object);
    return null;
  }

  visitExpressionStmt(stmt) {
    this.resolve(stmt.expression);
    return null;
  }

  visitIfStmt(stmt) {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
    return null;
  }

  visitPrintStmt(stmt) {
    this.resolve(stmt.expression);
  }

  visitReturnStmt(stmt) {
    if (this.currentFunction === FunctionType.NONE) {
      this.dragon.error(stmt.keyword, "Cannot return from top-level code.");
    }
    if (stmt.value !== null) {
      if (this.currentFunction === FunctionType.INITIALIZER) {
        this.dragon.error(
          stmt.keyword,
          "Cannot return a value from an initializer."
        );
      }
      this.resolve(stmt.value);
    }
    return null;
  }

  visitWhileStmt(stmt) {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
    return null;
  }

  visitBinaryExpr(expr) {
    this.resolve(expr.left);
    this.resolve(expr.right);
    return null;
  }

  visitCallExpr(expr) {
    this.resolve(expr.callee);

    let args = expr.args;
    for (let i = 0; i < args.length; i++) {
      this.resolve(args[i]);
    }

    return null;
  }

  visitGroupingExpr(expr) {
    this.resolve(expr.expression);
    return null;
  }

  visitLiteralExpr(expr) {
    return null;
  }

  visitLogicalExpr(expr) {
    this.resolve(expr.left);
    this.resolve(expr.right);
    return null;
  }

  visitUnaryExpr(expr) {
    this.resolve(expr.right);
    return null;
  }

  visitSetExpr(expr) {
    this.resolve(expr.value);
    this.resolve(expr.object);
    return null;
  }

  visitThisExpr(expr) {
    if (this.currentClass == ClassType.NONE) {
      this.dragon.error(expr.keyword, "Cannot use 'this' outside of class.");
    }
    this.resolveLocal(expr, expr.keyword);
    return null;
  }
};
