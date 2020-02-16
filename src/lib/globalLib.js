const RuntimeError = require("../errors.js").RuntimeError;
const DragonFunction = require("../structures/function.js");
const DragonInstance = require("../structures/instance.js");
const StandardFn = require("../structures/standardFn.js");
const DragonClass = require("../structures/class.js");

/**
 * Load all standard global functions to interpreter.
 */
module.exports = function(globals) {
  globals.defineVar(
    "len",
    new StandardFn(1, function(obj) {
      // don't allow len() to be called for numbers
      if (!isNaN(obj)) {
        throw new RuntimeError(
          this.token,
          "You can not find the length of a number."
        );
      }

      // don't allow len() to be called for instances
      if (obj instanceof DragonInstance) {
        throw new RuntimeError(
          this.token,
          "You can not find the length of an instance."
        );
      }

      if (obj instanceof DragonFunction) {
        return obj.declaration.params.length;
      }

      if (obj instanceof StandardFn) {
        return obj.arityValue;
      }

      if (obj instanceof DragonClass) {
        let methods = obj.methods;
        let length = 0;

        if (methods.init && methods.init.isInitializer) {
          length = methods.init.declaration.params.length;
        }

        return length;
      }

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
