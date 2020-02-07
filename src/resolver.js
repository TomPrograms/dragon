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
  FUNCTION: "FUNCTION"
};

module.exports = class Resolver {
  constructor(interpreter, dragon) {
    this.interpreter = interpreter;
    this.dragon = dragon;
    this.scopes = new Stack();

    this.currentFunction = FunctionType.NONE;
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

  resolveStmt(stmt) {
    stmt.accept(this);
  }

  resolve(statements) {
    for (let i = 0; i < statements.length; i++) {
      this.resolveStmt(statements[i]);
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
      this.resolveStmt(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  visitAssignExpr(expr) {
    this.resolveStmt(expr.value);
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

  visitExpressionStmt(stmt) {
    this.resolveStmt(stmt.expression);
    return null;
  }

  visitIfStmt(stmt) {
    this.resolveStmt(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
    return null;
  }

  visitPrintStmt(stmt) {
    this.resolveStmt(stmt.expression);
  }

  visitReturnStmt(stmt) {
    if (this.currentFunction === FunctionType.NONE) {
      this.dragon.error(stmt.keyword, "Cannot return from top-level code.");
    }
    if (stmt.value != null) {
      this.resolveStmt(stmt.value);
    }
    return null;
  }

  visitWhileStmt(stmt) {
    this.resolveStmt(stmt.condition);
    this.resolve(stmt.body);
    return null;
  }

  visitBinaryExpr(expr) {
    this.resolveStmt(expr.left);
    this.resolveStmt(expr.right);
    return null;
  }

  visitCallExpr(expr) {
    this.resolveStmt(expr.callee);

    let args = expr.args;
    for (let i = 0; i < args.length; i++) {
      this.resolveStmt(args[i]);
    }

    return null;
  }

  visitGroupingExpr(expr) {
    this.resolveStmt(expr.expression);
    return null;
  }

  visitLiteralExpr(expr) {
    return null;
  }

  visitLogicalExpr(expr) {
    this.resolveStmt(expr.left);
    this.resolveStmt(expr.right);
    return null;
  }

  visitUnaryExpr(expr) {
    this.resolveStmt(expr.right);
    return null;
  }
};
