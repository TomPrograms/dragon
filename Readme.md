<div align="center">
  <img alt="Dragon Lang Logo" src="./docs/logo.png">

  <p>Dragon is an object orientated, interpreted language that acts as an easy-to-use scripting language, that employs dynamic but strong typing and object oriented programming to make programming as nice as possible. </p>

  <img src="https://img.shields.io/bundlephobia/minzip/dragon-lang?label=npm%20minzipped%20size">
  <img src="https://img.shields.io/github/v/release/tomprograms/dragon"> 
  <img src="https://img.shields.io/badge/license-MIT-blue">
  <a href="./docs">
    <img src="https://img.shields.io/badge/click-to%20get%20started-brightgreen">
  </a>
</div>

<br>

```js
// fibonacci.drg
// print first one hundred numbers in the fibonacci sequence

class Fibonacci {
  init() {
    this.a = 0;
    this.b = 1;
  }

  next() {
    var newValue = this.a + this.b;
    this.a = this.b;
    this.b = newValue;
    return newValue;
  }
}

function run(times) {
  var fibonacci = Fibonacci();
  for (var i = 0; i < times; i = i + 1) {
    print(fibonacci.next());
  }
}

run(100);
```

## Features

- ✨ Easy-to-use typing system - dynamically but strongly typed for ease of use.
- 🔥 Eloquent syntax - reduce code length by creating functions, objects and loops.
- 🧹 Keep code clean - relative import system allows code to be easily split into files.
- ⚡️ Interpreted language - streamline development with no compile times.
- 🚀 Object-oriented programming - full object system with classes, methods, states and inheritance.
- ⚙ Simple data structures included - strings, numbers, lists and dictionaries.
- 🧠 Great control flow - if and else, for and while, switch and case all included.
- 🤖 Turing Complete - all features needed to build a complete turing machine.

## Documentation

You can get started by following the tutorial provided with the documentation [here](./docs).

## Credit

Author: [Tom](https://github.com/TomPrograms)

## License

[MIT](LICENSE)
