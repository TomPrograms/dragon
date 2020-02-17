# Imports

Dragon contains a similar import system to NodeJS - using relative paths, reserved keywords and an exports dictionary for importing files.

## Importing

Both files and [standard libraries](./standard-library.md#Libraries) can be imported. In the case of importing other Dragon files, a relative path should be provided to the function `import` which will return the exported data from the specified file. In the case of importing standard libraries, the library name should be passed to the `import` function which will return data (typically functions) that can be utilised in your program.

```js
// importing standard library
var os = import("os");

// importing Dragon file
var file = import("./test.drg");
```

When importing a file, the imported file will be run, in order to gather the exported data.

```js
// test2.drg

print("running");
```

```js
// test.drg

var file = import("./test2.drg"); // prints "running"

print(file); // prints "<module>"
```

Data can be accessed on the imported modules, depending on what data was exported.

## Exporting

Data can be exported from a file by assigning it to the variable `exports`, which is a dictionary by default. The exports variable can be replaced entirely to export a single value or attributes can be added to the exports dictionary to build up a module of multiple export values that the importing file can access data on.

Exporting values on the exports dictionary:

```js
// test2.drg

exports.func = function() {
  print("yes");
};
```

```js
// test.drg

var file = import("./test2.drg");

print(file); // prints "<module>"
file.func(); // prints "yes"
```

Exporting values as the exports variable:

```js
// test2.drg

exports = function() {
  print("yes");
};
```

```js
// test.drg

var file = import("./test2.drg");

print(file); // prints "<function>"
file(); // prints "yes"
```
