const RuntimeError = require("../errors.js").RuntimeError;

module.exports.round = function(num) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "You must provide a number to math.round(number)."
    );

  return Math.round(num);
};

module.exports.floor = function(num) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "You must provide a number to math.floor(number)."
    );

  return Math.floor(num);
};

module.exports.ceil = function(num) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "You must provide a number to math.ceil(number)."
    );

  return Math.ceil(num);
};

module.exports.sqrt = function(num) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "You must provide a number to math.sqrt(number)."
    );

  return Math.sqrt(num);
};

module.exports.root = function(num, root) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "Number provided to math.root(number, root) must be a number."
    );

  if (isNaN(root) || root === null)
    throw new RuntimeError(
      this.token,
      "Root provided to math.root(number, root) must be a number."
    );

  let originalRoot = root;

  let negateFlag = root % 2 == 1 && num < 0;
  if (negateFlag) num = -num;
  let possible = Math.pow(num, 1 / root);
  root = Math.pow(possible, root);
  if (Math.abs(num - root) < 1 && num > 0 == root > 0)
    return negateFlag ? -possible : possible;

  else throw new RuntimeError(this.token, `Unable to find the ${ originalRoot } root of ${ num }.`)
};

module.exports.sin = function(num) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "You must provide a number to math.sin(number)."
    );

  return Math.sin(num);
};

module.exports.cos = function(num) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "You must provide a number to math.cos(number)."
    );

  return Math.cos(num);
};

module.exports.tan = function(num) {
  if (isNaN(num) || num === null)
    throw new RuntimeError(
      this.token,
      "You must provide a number to math.tan(number)."
    );

  return Math.tan(num);
};

module.exports.radians = function(angle) {
  if (isNaN(angle) || angle === null)
    throw new RuntimeError(
      this.token,
      "You must provide an angle to math.radians(angle)."
    );

  return angle * (Math.PI / 180);
};

module.exports.degrees = function(angle) {
  if (isNaN(angle) || angle === null)
    throw new RuntimeError(
      this.token,
      "You must provide an angle to math.degrees(angle)."
    );

  return angle * (180 / Math.PI);
};

module.exports.pi = Math.PI;
