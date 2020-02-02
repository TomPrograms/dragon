const Scanner = require("./scanner.js");

class Dragon {
  run(code) {
    const scanner = new Scanner(code, this);
    const tokens = scanner.scan();

    console.log(tokens);
  }

  throw(line, error) {
    throw new Error(line + " " + error);
  }
}

module.exports = Dragon;
