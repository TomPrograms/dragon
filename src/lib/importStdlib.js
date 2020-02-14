const StandardFn = require("../structures/standardFn.js");
const DragonModule = require("../structures/module.js");

const loadModule = function(moduleName, modulePath) {
  let moduleData = require(modulePath);
  let newModule = new DragonModule(moduleName);

  let keys = Object.keys(moduleData);
  for (let i = 0; i < keys.length; i++) {
    let currentFunc = moduleData[keys[i]];

    newModule[keys[i]] = new StandardFn(currentFunc.length, currentFunc);
  }

  return newModule;
};

module.exports = function(name) {
  switch (name) {
    case "os":
      return loadModule("os", "./os.js");
    case "time":
      return loadModule("os", "./time.js");
  }

  return null;
};
