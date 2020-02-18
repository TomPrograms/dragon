# Control Flow

Dragon comes equipped with a full range of control flow options.

## Truthy Values

Integral to the control flow of all languages is truthy values, and how values compare and evaluate - since control flow options such as a `if` statement will only execute if the statement evaluates truthily, e.g. `if (true) {}` while execute due to the statement being truthy.

### Equality Comparison

In order for two objects to compare as truthy, they must be of the same type and of the same value, similarly to other strongly typed languages such as Python - consider the following examples:

```js
1 == 1; // truthy
"1" == "1"; // truthy
null == null; // truthy

"1" == "2"; // falsey
1 == 2; // falsey
1 == "1"; // falsey
```

The comparison either evaluates to `false` or `true` depending on whether the values are equal.

### Truthy Evaluation

All data types except `null` and `false` evaluate truthily.

```js
{} // truthy
1 // truthy
true // truthy
[] // truthy

1 == '1' // falsey due to evaluating to false
null // falsey
false // falsey
```

### Control Keywords

Dragon includes various keywords that assist with control flow.

- `and` - returns truthy is both values are true.
- `or` - returns truthy if either value is true.
- `in` - returns true if left value included in right value.

```js
true and true; // true
true and false; // false

false or false; // false
true or false; // true

'a' in ['b']; // false
'b' in ['b']; // true
'c' in 'abc'; // true
'key' in {'key': 'value'};
```

## If Elif Else Statements

Dragon provides if, elif and else statements for efficient control flow. Else and elif statements must be attached to a if statement and are optional. You may only provide one else statement. Each statement if followed by a body which is executed according the condition of the statement. The body of an if statement is executed if the condition is evaluated to be truthy, else any elif statements attached are evaluated in the order provided and if any of those conditions evaluated truthily their bodies are executed. Only one elif block can be executed. If the if statement isn't executed and no elif statements executed, if provided, the else block is executed.

```js
// prints "yes"
if (true) {
  print('yes');
}

// prints "match 2"
var a = 2;
if (a == 1) {
  print('match 1');
} elif (a == 2) {
  print('match 2');
} else {
  print('no match');
}

// prints "no match"
var a = 3;
if (a == 1) {
  print('match 1');
} elif (a == 2) {
  print('match 2');
} else {
  print('no match');
}
```

## While Statements

While statements within Dragon operate similarly to most languages - the while loop takes a condition and a body, with the body continuing to execute while the condition evaluates truthily. The check for truthy-ness is done before each time the body is executed, meaning no executions are guaranteed.

```js
// infinite loop
while (true) {
  print("yes");
}
```

## For Statements

For statements within Dragon take 4 arguments - an initializer, a condition, a step and a body. Any can be blank. The initializer is executed before the for loop, the condition deciding whether the body continues to execute, similarly to a `while` loop, the body to be executed and the step executing after the body during each loop. The `for` statement takes the initializer, condition and step wrapped in parentheses, separated by semi-colons and then a block statement for the body.

```js
// prints numbers 0-4
// initializer, condition, step
for (var i = 0; i < 5; i = i + 1) {
  // body
  print(i);
}

// initializer and step emitted
// prints infinitely due to always truthy condition
for (; true; ) {
  print("yes");
}
```

## Do While Statements

Introduced in Dragon 1.1.0, do while statements in Dragon act similarly to most languages - the `do` keyword is declared, followed by a block for the body, a `while` keyword and then a condition wrapped in parentheses. Unlike `while` statements, the test on the condition to decide whether to continue to execute the body is done after each execution of the body, meaning the body is guaranteed to execute at least once.

```js
// yes is printed once
do {
  print("yes");
} while (false);

// numbers 0-4 are printed
var i = 0;
do {
  print(i);
  i = i + 1;
} while (i < 5);
```

## Switch Case Default Statements

Case, switch statements in Dragon are an efficient way to chain together multiple if statements. The syntax requires a value (which is compared to each case), case branches and an optional default branch. At the start of the switch case, the value is evaluated and compared to the value of each case branch - if the values match, the relevant case body is executed and if no cases are executed, if provided, the default body is executed.

```js
// prints "matched option 2"
switch (1) {
  case "1":
    print("matched option 1");

  case 1:
    print("matched option 2");

  default:
    print("no match");
}

// prints "no match"
switch (2) {
  case "1":
    print("matched option 1");

  case 1:
    print("matched option 2");

  default:
    print("no match");
}
```

## Try Catch Finally Statements

Try, catch, finally within Dragon is used to handle any errors that could occur during the code execution. Both catch and finally blocks are optional. First, the try block is executed and if during execution any errors occur, if provided, the catch block is executed. The try block means that if any errors occur during execution, this doesn't halt the program. After both the try and, if provided, the catch block are executed, if provided, the finally block is executed.

```js
// prints "success" and "done"
try {
  print("success");
} catch {
  print("catch");
} finally {
  print("done");
}

// prints "catch" and "done"
try {
  // throws error
  1 > "1";

  print("success");
} catch {
  print("catch");
} finally {
  print("done");
}
```

Next: [Functions](./functions.md)
