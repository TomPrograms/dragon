module.exports = class DragonInstance {
  constructor(creatorClass) {
    this.creatorClass = creatorClass;
    this.fields = {};
  }

  get(name) {
    if (this.fields.hasOwnProperty(name.lexeme)) {
      return this.fields[name.lexeme];
    }

    let method = this.creatorClass.findMethod(name.lexeme);
    if (method) return method.bind(this);

    throw new RuntimeError(name, "Couldn't get undefined property.");
  }

  set(name, value) {
    this.fields[name.lexeme] = value;
  }

  toString() {
    return "<" + this.creatorClass.name + " instance>";
  }
};
