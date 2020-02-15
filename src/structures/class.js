const Callable = require("./callable.js");
const DragonInstance = require("./instance.js");

module.exports = class DragonClass extends Callable {
  constructor(name, superclass, methods) {
    super();
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  findMethod(name) {
    if (this.methods.hasOwnProperty(name)) {
      return this.methods[name];
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
    }

    return undefined;
  }

  toString() {
    return `<class ${this.name}>`;
  }

  arity() {
    let initializer = this.findMethod("init");
    return initializer ? initializer.arity() : 0;
  }

  call(interpreter, args) {
    let instance = new DragonInstance(this);

    let initializer = this.findMethod("init");
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }
};
