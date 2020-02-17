# Functions

Functions in Dragon come in two types - standard functions and anonymous functions.

## Standard Functions

Standard Functions can be declared using the `function` keyword, a function name, a list of parameters surrounded by brackets and then a block for the body of the function.

```js
function main() {
  print("yes!");
}

print(main); // outputs <function main>
```

Standard functions are declared like variables and also bound to the local scope like normal variables.

## Anonymous Functions

Anonymous functions are slightly different than normal functions. Anonymous functions do not have a name, and aren't declared like variables, however can be used like expressions such as strings. Below achieves the same effect as it uses an anonymous function as an expression and declares it as variable `main`, which standard functions typically do. Note: the anonymous function requires a `;` at the end in this example due to being treated as an expression.

```js
var main = function() {
  print("yes!");
};
```

## Calling Functions

Functions in Dragon can be called and passed parameters. Dragon functions are called like so, with arguments inside the brackets. Only functions (and class methods) can be called.

```js
function main() {
  print("yes!");
}

main();
main(1); // single parameter
```

## Returns

Similarly to most languages, Dragon functions can return data, which the call statement becomes equal to, using the `return` keyword. Returning from a function ends the current execution of the function. You can return no data to terminate the function.

```js
function main() {
  return 1;
}

var data = main(); // data becomes equal to the returned value
print(data); // outputs 1
```

```js
function main() {
  print("a"); // outputs a
  return;
  print("b"); // doesn't run
}

var data = main(); // data becomes equal to null, due to nothing returned
print(data); // outputs null
```

## Parameters

Parameters are unstrict in Dragon and support standard and wildcard parameters.

### Standard Parameters

Standard parameters can be declared while declaring a function, by providing a variable name like the following:

```js
function main(a) {
  print(a);
}
```

The first argument passed when calling the function will be a variable under the name of the parameter, in this case `a`. Multiple parameters can be used with a function, with each parameter name being separated by a `,`.

```js
function main(a, b) {}
```

Parameters are unstrict, like Javascript and unlike Python, meaning too many or too few parameters can be passed to the function with no problem. Extra parameters will be disregarded, and any lacking parameters will equate to `null`.

```js
function main(a, b) {
  print(a);
  print(b);
}

main(1, 2); // outputs 1 and 2
main(1, 2, 3); // outputs 1 and 2
main(1); // outputs 1 and null
main(); // outputs null and null
```

### Wildcard Parameters

Wildcard can take an unlimited amount of extra parameters, providing them in an array. Wildcard parameters are declared by prefacing a parameter name with `*` and must always be the final parameter. For example, if two extra parameters are provided to a function with a wildcard, the wildcard parameter equates to an array of those parameters.

```js
function main(a, *b) {
  print(a); // outputs 1
  print(b); // outputs [2, 3]
}

main(1, 2, 3);
```

Wildcard parameters still equate to a list if only one parameter is captured by the wildcard.

```js
function main(a, *b) {
  print(a); // outputs 1
  print(b); // outputs [2]
}

main(1, 2);
```

Like all parameters, if no arguments are provided for the parameter, the parameter will equate to `null`.

```js
function main(a, *b) {
  print(a); // outputs 1
  print(b); // outputs null
}

main(1);
```

## Summary

All this means we can write a program like the following, which utilises standard and anonymous functions with standard and wildcard parameters.

```js
function main(func) {
  func(1, 2, 3);
}

// outputs [1, 2, 3]
main(function(*args) {
  print(args);
});
```

Next: [Classes](./classes.md)
