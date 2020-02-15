# The Dragon Programming Language

Dragon is an interpreted language, built ontop of NodeJS. It features syntax high-level languages such as Python and Javascript and supports full object-orientated programming and the control flow and data types you know and love. Below is a snippet of Dragon code, showcasing a class-based fibonacci sequence program:

```js
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

Next: [Installation](./installation.md)
