![Dragon Lang Logo](./docs/logo.png)

The dragon lang is a high-level, dynamically typed, interpreted language.

[![Dragon Lang License Badge](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

```dragon
// fibonacci.drg
// print first one hundred numbers in the fibonacci sequence

function fibonacci(iterations) {
  var a = 0;
  var b = 1;
  for (var i = 0; i < iterations; i = i + 1) {
    var temp = a + b;
    a = b;
    b = temp;
    print(temp);
  }
}

fibonacci(100);
```
