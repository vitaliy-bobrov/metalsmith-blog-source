---
title: Introduction to Functional JavaScript
description: Basic functional programming principles for beginers.
ogimage: images/posts/introduction-to-functional-js/introduction-to-functional-js-og.jpg
tumb: /images/posts/introduction-to-functional-js/introduction-to-functional-js
created: 2017-03-19
categories:
- Functional Programming
---
Functional programming -- this words you might read a lot of times during last year, especially in JavaScript context. Today I'll try to demystify its basic principles for newbies in easiest and beginner-friendly manner.

So what is functional programming? You can find some definition in [Wikipedia](https://en.wikipedia.org/wiki/Functional_programming), but long story short, **functional programming** (FP) is a programming paradigm to write laconic and readable code. JavaScript itself give developer freedom what coding style to use -- Object-Oriented (OOP), Procedural or Functional. But on the other side function in JS is _first-class citizen_. This means that functions could be pass as an argument to other functions. This is one of the main conditions to write functional code.

But you may ask -- why we should make code functional? It is the reasonable question and there are some cons that it brings:

- Reusable
- Readable
- Easy to test
- Less error prone

The main difference that classes operate with objects and its state, as well as other objects states, it is good and bad at the same time. Why? - Because you might need to synchronize states of different objects in runtime to control your application. Functional programming instead brings the idea that functions shouldn't change anything outside function scope. Such changes called **side-effects**.

OOP creates the connection between objects that results in problems in testing. In tests developers trying to separate each piece of functionality to avoid the impact of other modules. That means that you should mock dependencies, write more boilerplate code, etc. Functional programming instead forces you to write independent pieces of code, that also means that such code could be used in other places or even projects without any modifications.

Unfortunately, any application with user interface could be created without side-effects because you need to fetch data from backed, manipulate DOM-tree or even log something to console. All these actions also are side-effects and produce **mutations** -- data changes.

## Pure functions
The functions that don't manipulate with any values outside its own scope called **pure functions**. There are simple rules to write such functions:

- It should always return value
- It should **NOT** change any data outside
- It should always return the same result for the same passed arguments

Looks simple, doesn't it? So the simple example of the pure function:

```js
function add(x, y) {
  return x + y;
}

var result = add(2, 3); // Always return 5.
```

You may say that it too easy, but here is the example how to easy broke the rules:

```js
var x = 2;

function impureAdd(y) {
  return x + y;
}

var result = impureAdd(3); // return 5.
```

As you can see function make the same manipulation and returns the same result... but it changes global variable `x` that is out of its scope. It this case if another function changed this variable result will be different, this mean that function could return another value for the same passed argument -- it is not pure.

One of the features for which developers love ES2016 (also known as ES6) -- _arrow functions_, they provide short and expressive way to write such simple functions, also called **lambda**. Here is the pretified modern variand of `add` function:

```js
const add = (x, y) => x + y;
const result = add(2, 3); // 5
```

The same function written in one line (one-liner), I'm loving it!

## Immutability
Another important idea of FP that implies side-effects reducing -- immutable data. The main idea that value that has been assigned once can't change, and instead re-assigning value we should provide completely new one.

JavaScript as universal language don't provide immutable data structures out-of-box. The only immutable primitive is a `String`. Every time when you modify the string, under the hood JS engine return you a completely new string. Here is the example:

```js
var str = 'Change This String';

var noSpaces = str.replace(' ', '');
var lowerStr = str.toLowerCase();

// Still same string `Change This String`.
console.log(str);

// New modified string `ChangeThisString`.
console.log(noSpaces);

// Another modifies source string `change this string`.
console.log(lowerStr);
```

Any method call on original string modified source, every time new string created for the new variable. But if we try to do something with objects the result might be confusing.

One of the nice features that ES2015 brought to us is a `const` keyword. Its name looks like a _constant_ and seems to mean immutability, but it only **mean that you can't assign a completely new value to a variable defined with it**. What it mean in practice:

```js
var mutableObj = {a: 1};

mutableObj = {b: 2}; // no errors.

const immutableObj = {a: 1};

// will throw TypeError: "Assignment to constant variable".
imuutableObj = {b: 2};
```
But in other hand you can modify objects and no error will be thrown.

```js
const immutable = {a: 1};

// no errors.
immutable.a = 3;
immutable.b = 4;

console.log(immutable); // {a: 3, b: 4}.

const arr = [1, 2, 3];

// no error.
arr.push(4);

console.log(arr); // [1, 2, 3, 4].
```
To make such objects really immutable we need to prevent any modifications, changing existing values, adding new values. `Object` in JavaScript has a static method called `freeze` that prevent object mutations, but only in shallow manner. Here is code proof:

```js
const imm = Object.freeze({a: 1});

// no errors.
imm.a = 2;
imm.b = 3;

console.log(imm); // {a: 1} nothing changed.

const obj = Object.freeze({
  arr: [1, 2]
});

// no error.
obj.arr.push(3);

console.log(obj); // {arr: [1, 2, 3]} array was changed.
```
As you see `Object.freeze` don't provide deep object immutability. In such cases, you could use special immutable data structures provided by libraries like [ImmutableJS](https://facebook.github.io/immutable-js/). But in real projects, you only need such libraries to use in tests. Instead of including it in your production application you should propose a convention in your team to not mutate data, and proof this convention in unit tests.

## Readability
Readability means that your code should be written in more expressive. In most situations, you should prefer ternary operators, replace switch statements, use `Array` methods to manipulate data instead using loops. But this not means that you should obfuscate code by hands, always think about how your code will be read and is it simple to realize what is going on. If you don't keep that in mind your teammates will hate you and your code 😠. Below there are a bunch of how to DO and to DON'T write functional code.

### if/else statements
DON'T: Write if/else for simple cases.
```js
// - DON'T.
if (a === 1) {
  var b = 1;
} else {
  var b = 0;
}
```
DO: Use ternary operators for simple cases.
```js
var b = a === 1 ? 1 : 0;
```

DON'T: Use multiple ternary operators.
```js
var a = b === 1 ? c === 2 ? 1 : 2 : 3;
```

DO: Use if/else for sibling statements.
```js
var a;

if (b === 1) {
  if (c === 2) {
    a = 1;
  } else {
    a = 2;
  }
} esle {
  a = 3;
}
```

### switch statements
DON'T: Use switch for simple value assignment.
```js
var result;

switch (value) {
  case 'someValue':
    result = 'something';
    break;

  case 'otherValue':
    result = 'another';
    break;

  default:
    result = 'default';
    break;
}
```

DO: Use object literal for simple value assigment.
```js
const result = {
  someValue: 'something',
  otherValue: 'another'
}[value] || 'default';
```

The result will be the same as in the previous example with `switch`, but it is shorter and more readable. You trying to get object value by the key provided in `value` variable, if value not found it returns `undefined` and the default value will be assigned.

### Loops
DON'T: Use loops for simple data modification.
```js
const arr = [1, 2, 3];

for(let i = 0; i < arr.length; i++) {
  arr[i] = arr[i] * 2;
}
```

DO: Use array methods and try not to mutate data.
```js
const arr = [1, 2, 3];
const doubled = arr.map(i => i * 2);
```

With arrow functions, such array manipulations become short and expressive.

## Summary
There were basic principles of Functional Programming. It was really simple, isn't it? After you will feel good with this one, you could start to dive deeper. In the next article, I'll explain how to handle arrays modifications in a functional way. Stay tuned and write your questions in the comments. May the functional force be with you 😎.
