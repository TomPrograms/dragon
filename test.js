const Dragon = require("./src/dragon.js");
const main = new Dragon();

main.run(`

for (var i=0; i < 10; i = i+1) {
  print();
}


`);
