# Variables

Variables in Dragon are block-scoped. Variables can be declared as such, using the `var` keyword, the variable name, equals operator and then the value.

```js
var a = "1";
```

Variables can be mutated without the var keyword, however declaring a variable outside of the global scope, without the `var` keyword will throw an error.

```js
var a = "1";
a = "2";
print(a); // outputs 2
```

Variables declared in a higher scope can be accessed in a lower scope, however variables declared in a lower scope cannot be accessed in a higher scope.

```js
{
  var a = "1";
}

print(a); // throws error
```

```js
var a = "1";
{
  print(a); // outputs 1
}
```

Lower scope variables take precedence over higher scope variables when accessing the variable. If you redeclare the variable in a lower scope, this doesn't affect the higher scope variable outside the lower scope, however if you modify a higher scope variable in a lower scope variable, this persists.

```js
var a = "1";
{
  a = "2";
}

print(a); // outputs 2
```

```js
var a = "1";
{
  var a = "2";
  print(a); // outputs 2
}

print(a); // outputs 1
```

Next: [Operators](./operators.md)
