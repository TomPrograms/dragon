const fibonacci = `var a = 0;
var b = 1;

for (var i = 0; i < 100; i = i + 1) {
  var temp = a + b;
  a = b;
  b = temp;

  print(temp);
}`;

const classes = `// examples of class based programming in Dragon

// declaring a class
class Test {
  // class constructor
  init(name) {
    // save value to instance
    this.name = name;
  }

  // print class' name
  sayName() {
    // access value from instance
    print(this.name);
  }
}

// create new instance
var person = Test("Tom");
person.sayName(); // prints "Tom"`;

const functions = `function main(func) {
  func(1, 2, 3);
}

// outputs [1, 2, 3]
main(function(*args) {
  print(args);
});`;

const demos = {
  fibonacci,
  classes,
  functions,
  custom: ""
};
