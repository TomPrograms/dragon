const Dragon = require("./src/dragon.js");
const main = new Dragon();

main.run(`

var a = 0;
var b = 1;

while (a < 10000) {
  print a;
  var temp = a;
  a = b;
  b = temp + b;
}


`);
