const StandardFn = require("../structures/standardFn.js");
const Expr = require("../Expr.js");

/**
 * Load all standard global functions to interpreter.
 */
module.exports = function(globals) {
  globals.defineVar(
    "clock",
    new StandardFn(0, function() {
      return Date.now() / 1000;
    })
  );

  globals.defineVar(
    "len",
    new StandardFn(1, function(obj) {
      return obj.length;
    })
  );

  globals.defineVar(
    "str",
    new StandardFn(1, function(value) {
      return `${value}`;
    })
  );

  globals.defineVar(
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

  globals.defineVar(
    "int",
    new StandardFn(1, function(value) {
      if (value === undefined || value === null) {
        throw new RuntimeError(
          this.token,
          "Only numbers can be parsed to integers."
        );
      }

      if (!/^-{0,1}\d+$/.test(value) && !/^\d+\.\d+$/.test(value)) {
        throw new RuntimeError(
          this.token,
          "Only numbers can be parsed to integers."
        );
      }

      return parseInt(value);
    })
  );

  globals.defineVar("exports", {});

  return globals;
};
