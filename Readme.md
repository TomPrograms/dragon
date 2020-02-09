<div align="center">
  <img alt="Dragon Lang Logo" src="./docs/logo.png">

  <p>Dragon is an object orientated, interpreted language. Dragon is a quick and easy-to-use scripting language, that employs dynamic but strong typing and object oriented programming to make programming as nice as possible.</p>

  <a href="./LICENSE">
    <img alt="Dragon Lang License Badge" src="https://img.shields.io/badge/license-MIT-blue">
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
- 🔥 Eloquent syntax - reduce code length with objects, functions and returns.
- ⚡️ Interpreted language - streamline development with no compile times.
- 🔧 Object-oriented programming - full object system with classes, methods, states and inheritance.
- ⚙️ Simple data structures included - strings, numbers, lists and dictionaries.
- 🧠 Great control flow - if and else, while and for statements all included.
- 🤖 Turing Complete - all features needed to build a complete turing machine.

<!--
## Installation and Usage

You can install Dragon through the NPM:

```
$ npm i -g dragon-lang
```

Executing a file using Dragon:

```
$ dragon test.drg
```

Using the Dragon shell:

```
$ dragon
```
-->

## Credit

Author: [Tom](https://github.com/TomPrograms)

Lox and Javascript were inspirational to the creation of this language.

## License

[MIT](LICENSE)
