module.exports = class DragonModule {
  constructor(name) {
    if (name !== undefined) this.name = name;
  }

  toString() {
    return this.name ? `<module ${this.name}>` : "<module>";
  }
};
