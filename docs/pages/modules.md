# Imports

Dragon contains a similar import system to NodeJS - using relative paths, reserved keywords and an exports dictionary for importing files.

## Importing

Both files and standard modules can be imported. In the case of importing other Dragon files, a relative path should be provided to the function `import` which will return the exported data from the specified file. In the case of importing standard libraries, the module name should be passed to the `import` function which will return data (typically functions) that can be utilised in your program.

```js
// importing standard module
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

## Standard Modules

Standard modules are included with Dragon to provide extra in-built functionality. Standard modules can be imported by using the `import` function and providing the name of the standard module.

```js
var time = import("time");

print(time.time());
```

### Current Standard Modules

- time
  - .time() - get epoch timestamp.
  - .localTime(epoch) - get timestamp formatted to computer's local area. Can be provided epoch time to format, else defaults to current epoch time.
  - .sleep(ms) - stop program running for specified amount of milliseconds.
- os
  - .read(path, encoding) - returns contents of file at path, using encoding with defaults to UTF-8.
  - .write(path, data, encoding) - writes data (defaults to "") to file at path with encoding (defaults to "UTF-8").
  - .delete(path) - deletes file at path.
  - .mkdir(path) - makes folder at path.
  - .deletedir(path) - deletes folder at path.
  - .listdir(path) - returns contents of folder at path in a list.
- math
  - .round(number) - rounds number to nearest integer.
  - .floor(number) - rounds down number.
  - .ceil(number) - rounds up number.
  - .sqrt(number) - square roots number.
  - .root(num, root) - finds the specified root of the provided number.
  - .sin(num) - finds sin value of number.
  - .cos(num) - finds cos value of number.
  - .tan(num) - finds tan value of number.
  - .radians(degrees) - converts degrees to radians.
  - .degrees(radians) - converts radians to degrees.
  - .pi - returns approximated value of Pi.
