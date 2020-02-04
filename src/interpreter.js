const tokenTypes = require("./tokenTypes.js");
const RuntimeError = require("./runtimeError.js");

module.exports = class Interpreter {
  constructor(Dragon) {
    this.Dragon = Dragon;
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

        cons;

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
  
  visitExpressionStmt(stmt) {
    this.evaluate(stmt.expression);
    return null;
  }

  visitPrintStmt(stmt) {
    let value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
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
      for (let i=0; i < statements.length; i++) {
        this.execute(statements[i]);
      }
    } catch (error) {
      this.Dragon.runtimeError(error);
    }
  }
};
