# Classes

Dragon contains a complete OOP system including inheritance, state, methods, super, constructors and everything else you would expect in an OOP language.

## Creating Classes

Classes can be declared by using the keyword class, providing a class name (which will act as a variable in the current environment) and a block for the body of the function.

```js
class Test {}
```

### Instancing Classes

An instance of a class can be created by calling the name of the relevant class as a function, which will return an instance.

```js
class Test {}

var test = Test();
print(test); // prints "<Test instance>"
```

### Methods

Methods are the heart of OOP and can be added to objects in Dragon. Methods can be declared in the class body like standard functions but without the `function` keyword. Methods can also take and be passed parameters, just like normal functions.

```js
class Test {
  testFunc() {
    print('hello');
  }
}
```

These methods can be called on an instance by accessing attributes of the instance with `.` and then calling the relevant attribute for the method.

```js
class Test {
  testFunc() {
    print('hello');
  }
}

var test = Test();
test.testFunc(); // prints "hello"
```

### This

Inside each instances methods, the keyword `this` is used to represent the relevant instance. The keyword `this` is declared automatically.

```js
class Test {
  init() {
    print(this);
  }
}

var test = Test(); // prints "<Test instance>"
```

### State

Classes can contain other attributes, other than methods, such as variables. These variables can be set in any one of the classes functions, using the keyword `this` to reference the current instance. State can be accessed in the same manner.

```js
class Test {
  testFunc() {
    this.a = 100;
    print(this.a); // prints "100"
  }
}

var test = Test();
test.testFunc();
```

State can also be changed by modifying the attributes of the variable containing the instance. State can be accessed in the same manner.

```js
class Test {}

var test = Test();
test.a = 100;
print(test.a); // prints "100"
```

### Constructors

The constructor function in Dragon is the method with the name `init`. The constructor function is called automatically when the object is instanced and can be used to setup the object.

```js
class Test {
  init() {
    print('yes');
  }
}

var test = Test(); // prints "yes"
```

## Inheritance

In Dragon, classes can inherit the methods of their "super" class, potentially reducing code repetition. Classes can inherit other classes by declaring the keyword `extends` after the class name declaration and then the name of the class to inherit afterwards. 

```js
class A {}

class B extends A {}
```

Classes inherit all the methods of their super class. When initiating a new function, the constructor function of the super class is not run.

```js
class A {
  test() {
    print('yes');
  }
}

class B extends A {}

var a = B();
a.test(); // prints "yes"
```

Inside a class' methods, the `super` keyword can be used to call any methods or classes of the super class.

```js
class A {
  printData(data) {
    print(data);
  } 
}

class B extends A {
  init(data) {
    super.printData(data);
  }
}

var a = B("hello");
```