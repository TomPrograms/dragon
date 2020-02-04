const tokenTypes = require("./tokenTypes.js");
const RuntimeError = require("./runtimeError.js");
const Environment = require("./environment.js");

class BreakException extends Error {}

module.exports = class Interpreter {
  constructor(Dragon) {
    this.Dragon = Dragon;
    this.environment = new Environment();
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

    return left == right;
  }

  checkNumberOperands(operator, left, right) {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  visitBinaryExpr(expr) {
    let left = this.evaluate(expr.left);
    let right = this.evaluate(expr.right);

    switch (expr.operator.type) {
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

      case tokenTypes.BANG_EQUAL:
        return !this.isEqual(left, right);

      case tokenTypes.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    return null;
  }

  visitAssignExpr(expr) {
    let value = this.evaluate(expr.value);

    this.environment.assignVar(expr.name, value);
    return value;
  }

  visitVariableExpr(expr) {
    return this.environment.getVar(expr.name);
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

  stringify(object) {
    if (object === null) return "nil";

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
