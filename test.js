const Dragon = require("./src/dragon.js");
const main = new Dragon();

main.run(`

for (var i = 2; i < 100; i = i**2) {
  print(i);
}

`);
