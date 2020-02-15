# Basic Data Types

Dragon data types, like most high-level languages, are dynamic (their type can change) and come in broad categories. The basic data types can be seen below.

```js
1
"hello"

[1, "2" , 3]
{
  test: 'test',
  test2: 1
}

null
true
false
```

## Strings

Strings can be declared in Dragon by wrapping data in either `""` or `''`. Individual characters in the string can be accessed but not mutated through subscripting, with indexing beginning at 0. Minus subscripting indexes can be used to access data starting from the other side.

```js
'abc';
"abc";

"abc"[0]; // equals a
"abc"[-1]; // equals c
```

## Numbers

Numbers in Dragon can be either floats or integers.

```js
1.1;
1;
```

## Arrays

Arrays in Dragon can contain any data types. Arrays are encased by `[]` with each value separated by a `,`. Arrays indexes that are out of range can be mutated but not accessed with subscripting, with indexing starting at 0.

```js
[1, '2'];
[];

[1, '2'][0]; // equals 1
[1, 2][2]; // throws error

[1, 2][1] = 3; // array becomes equal to [1, 3]
[1, 2][2] = 3; // array becomes equal to [1, 2, 3]
[1, 2][3] = 3; // array becomes equal to [1, 2, null, 3]
```

## Dictionaries

Dictionaries in Dragon work with a standard key, value system, with values being able to be assigned, mutated and accessed by subscipting.

```js
{};
{'a': 'b'};

{'a': 'b'}['a']; // equals 'b'

{}['a'] = 'b'; // dictionary becomes equal to {'a': 'b'}
{'a': 1}['a'] = 2; // dictionary becomes equals to {'a': 2}
```

## Null

Null is a data type that is used within Dragon to represent empty or undefined data.

```js
null
```

## Booleans

`true` and `false` booleans are a data type within Dragon. Booleans must be declared in all lowercase.

```js
true
false
```

Next: [Variables](./variables.md)
