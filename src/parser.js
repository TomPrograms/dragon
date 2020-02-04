const tokenTypes = require("./tokenTypes.js");
const Expr = require("./Expr.js");
const Stmt = require("./Stmt.js");

class ParserError extends Error {}

module.exports = class Parser {
  constructor(tokens, Dragon) {
    this.tokens = tokens;
    this.Dragon = Dragon;

    this.current = 0;
    this.loopDepth = 0;
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == tokenTypes.SEMICOLON) return;

      switch (this.peek().type) {
        case tokenTypes.CLASS:
        case tokenTypes.FUNCTION:
        case tokenTypes.VAR:
        case tokenTypes.FOR:
        case tokenTypes.IF:
        case tokenTypes.WHILE:
        case tokenTypes.PRINT:
        case tokenTypes.RETURN:
          return;
      }

      this.advance();
    }
  }

  error(token, errorMessage) {
    this.Dragon.error(token, errorMessage);
    return new ParserError();
  }

  consume(type, errorMessage) {
    if (this.check(type)) return this.advance();
    else throw this.error(this.peek(), errorMessage);
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  isAtEnd() {
    return this.peek().type == tokenTypes.EOF;
  }

  advance() {
    if (!this.isAtEnd()) this.current += 1;
    return this.previous();
  }

  match(...args) {
    for (let i = 0; i < args.length; i++) {
      let currentType = args[i];
      if (this.check(currentType)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  primary() {
    if (this.match(tokenTypes.FALSE)) return new Expr.Literal(false);
    if (this.match(tokenTypes.TRUE)) return new Expr.Literal(true);
    if (this.match(tokenTypes.NIL)) return new Expr.Literal(null);

    if (this.match(tokenTypes.NUMBER, tokenTypes.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(tokenTypes.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(tokenTypes.LEFT_PAREN)) {
      let expr = this.expression();
      this.consume(tokenTypes.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  unary() {
    if (this.match(tokenTypes.BANG, tokenTypes.MINUS)) {
      let operator = previous();
      let right = unary();
      return new Expr.Unary(operator, right);
    }

    return this.primary();
  }

  addition() {
    let expr = this.multiplication();

    while (this.match(tokenTypes.MINUS, tokenTypes.PLUS)) {
      let operator = this.previous();
      let right = this.multiplication();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  multiplication() {
    let expr = this.unary();

    while (this.match(tokenTypes.SLASH, tokenTypes.STAR)) {
      let operator = this.previous();
      let right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  comparison() {
    let expr = this.addition();

    while (
      this.match(
        tokenTypes.GREATER,
        tokenTypes.GREATER_EQUAL,
        tokenTypes.LESS,
        tokenTypes.LESS_EQUAL
      )
    ) {
      let operator = this.previous();
      let right = this.addition();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  equality() {
    let expr = this.comparison();

    while (this.match(tokenTypes.BANG_EQUAL, tokenTypes.EQUAL_EQUAL)) {
      let operator = this.previous();
      let right = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  and() {
    let expr = this.equality();

    while (this.match(tokenTypes.AND)) {
      let operator = this.previous();
      let right = this.equality();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  or() {
    let expr = this.and();

    while (this.match(tokenTypes.OR)) {
      let operator = this.previous();
      let right = this.and();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  assignment() {
    let expr = this.or();

    if (this.match(tokenTypes.EQUAL)) {
      let equals = this.previous();
      let value = this.assignment();

      if (expr instanceof Expr.Variable) {
        let name = expr.name;
        return new Expr.Assign(name, value);
      }

      this.error(equals, "Invalid assignment target");
    }

    return expr;
  }

  expression() {
    return this.assignment();
  }

  printStatement() {
    let value = this.expression();
    this.consume(tokenTypes.SEMICOLON, "Expected ';' after value.");
    return new Stmt.Print(value);
  }

  expressionStatement() {
    let expr = this.expression();
    this.consume(tokenTypes.SEMICOLON, "Expected ';' after expression.");
    return new Stmt.Expression(expr);
  }

  block() {
    let statements = [];

    while (!this.check(tokenTypes.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(tokenTypes.RIGHT_BRACE, "Expected '}' after block.");
    return statements;
  }

  ifStatement() {
    this.consume(tokenTypes.LEFT_PAREN, "Expected '(' after 'if'.");
    let condition = this.expression();
    this.consume(tokenTypes.RIGHT_PAREN, "Expected ')' after if condition.");

    let thenBranch = this.statement();
    let elseBranch = null;
    if (this.match(tokenTypes.ELSE)) {
      elseBranch = this.statement();
    }

    return new Stmt.If(condition, thenBranch, elseBranch);
  }

  whileStatement() {
    try {
      this.loopDepth += 1;

      this.consume(tokenTypes.LEFT_PAREN, "Expected '(' after 'while'.");
      let condition = this.expression();
      this.consume(tokenTypes.RIGHT_PAREN, "Expected ')' after condition.");
      let body = this.statement();

      return new Stmt.While(condition, body);
    } finally {
      this.loopDepth -= 1;
    }
  }

  forStatement() {
    try {
      this.loopDepth += 1;

      this.consume(tokenTypes.LEFT_PAREN, "Expected '(' after 'for'.");

      let initializer;
      if (this.match(tokenTypes.SEMICOLON)) {
        initializer = null;
      } else if (this.match(tokenTypes.VAR)) {
        initializer = this.varDeclaration();
      } else {
        initializer = this.expressionStatement();
      }

      let condition = null;
      if (!this.check(tokenTypes.SEMICOLON)) {
        condition = this.expression();
      }

      let increment = null;
      if (!this.check(tokenTypes.RIGHT_PAREN)) {
        increment = this.expression();
      }

      this.consume(tokenTypes.RIGHT_PAREN, "Expected ')' after clauses");

      let body = this.statement();

      if (increment !== null) {
        body = new Stmt.Block([body, new Stmt.Expression(increment)]);
      }

      if (condition == null) condition = new Expr.Literal(true);

      body = new Stmt.While(condition, body);

      if (initializer !== null) {
        body = new Stmt.Block([initializer, body]);
      }

      return body;
    } finally {
      this.loopDepth -= 1;
    }
  }

  breakStatement() {
    if (this.loopDepth < 1) {
      this.error(this.previous(), "'break' must be inside a loop.");
    }

    this.consume(tokenTypes.SEMICOLON, "Expected ';' after 'break'.");
    return new Stmt.Break();
  }

  statement() {
    if (this.match(tokenTypes.BREAK)) return this.breakStatement();
    if (this.match(tokenTypes.FOR)) return this.forStatement();
    if (this.match(tokenTypes.WHILE)) return this.whileStatement();
    if (this.match(tokenTypes.IF)) return this.ifStatement();
    if (this.match(tokenTypes.PRINT)) return this.printStatement();
    if (this.match(tokenTypes.LEFT_BRACE)) return new Stmt.Block(this.block());

    return this.expressionStatement();
  }

  varDeclaration() {
    let name = this.consume(tokenTypes.IDENTIFIER, "Expect variable name.");
    let initializer = null;
    if (this.match(tokenTypes.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(
      tokenTypes.SEMICOLON,
      "Expect ';' after variable declaration."
    );
    return new Stmt.Var(name, initializer);
  }

  declaration() {
    try {
      if (this.match(tokenTypes.VAR)) return this.varDeclaration();

      return this.statement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  parse() {
    let statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }
};