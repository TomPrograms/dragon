const Dragon = require("./src/dragon.js").Dragon;

const main = function() {
  let args = process.argv;

  const dragon = new Dragon();
  if (args.length === 2) {
    dragon.runPrompt();
  } else {
    dragon.runfile(args[2]);
  }
};

main();
