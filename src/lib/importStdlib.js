const StandardFn = require("../structures/standardFn.js");
const DragonModule = require("../structures/module.js");

const loadModule = function(moduleName, modulePath) {
  let moduleData = require(modulePath);
  let newModule = new DragonModule(moduleName);

  let keys = Object.keys(moduleData);
  for (let i = 0; i < keys.length; i++) {
    let currentItem = moduleData[keys[i]];

    if (typeof currentItem === "function") {
      newModule[keys[i]] = new StandardFn(currentItem.length, currentItem);
    } else {
      newModule[keys[i]] = currentItem;
    }
  }

  return newModule;
};

module.exports = function(name) {
  switch (name) {
    case "os":
      return loadModule("os", "./os.js");
    case "time":
      return loadModule("os", "./time.js");
    case "math":
      return loadModule("math", "./math.js");
  }

  return null;
};
