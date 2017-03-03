---
title: Introduction to Functional JavaScript
description: Basic functional programming principles for beginers.
ogimage: images/posts/introduction-to-functional-js/introduction-to-functional-js-og.jpg
tumb: /images/posts/introduction-to-functional-js/introduction-to-functional-js
created: 2017-03-01
categories:
- Functional Programming
---
Functional programming -- this words you might heared/read a lot of times during last year, especially in JavaScript context. Today I'll try to demistify its basic principles for newbies in easiest and begginer-friendly manner.

So what is functional programming? You can find some definition in [Wikipedia](https://en.wikipedia.org/wiki/Functional_programming), but long story short, **functional programming** (FP) is a programming paradigm to write laconic and readable code. JavaScript itself give developer freedom what coding style to use -- Object-Oriented (OOP), Procedural or Functional. But on the other side functions in JS is _first-class citizen_. This means that functions could be pass as argument to another functions. This is one of the main conditions to write functional code.

But you may ask -- why we should make code functional? It is reasonable question and there is some cons that it brings:

- Reusable
- Redable
- Easy to test
- Less error prune

The main difference that classes operates with objects and its state, as well as other objects states, it is good and bad at the same time. Why? - Because you might need to synchronise states of different objects in runtime to controll your application. Functional programming instead brings the idea that functions shouldn't change anything outside function scope. Such changes called **side-effects**.

OOP creates connection between objects that results problems in testing. In tests developers trying to separate eahc piece of functionality to avoid impact of other modules. That means that you should mock dependencies, white more boilerplate code, etc. Functional programming instead force you to write independent pieces of code, that also means that such code could be used in other places or even projects without any modifications.

Unfortunatly any application with user interface could be created without side-effects, because you need to fetch data from backed, manipulate DOM-tree or even log something to console. All this actions also are side-effects and produce **mutations** -- data changes.

## Pure functions
The functions that don't manipulate with any values outside its own scope called **pure functions**. There are simple rules to write such functions:

- It should always return value
- It should **NOT** change any data outside
- It should always return the same result for the same passed arguments

Looks simple, doesn't it? So the simplies example of pure function:

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

As you can see function make the same manipulation and returns same result... but it changes global variable `x` that is out of its scope. It this case if another function changed this varialbe result will be different, this mean that function could return another value for the same passed argument -- it is not pure.

One of the features for which developers love ES2016 (aka ES6) -- _arrow functions_, they provide short and expressive way to write such simple functions, also called **lambda**. Here is the pretified modern variand of `add` function:

```js
const add = (x, y) => x + y;
const result = add(2, 3); // 5
```

The same function written in one line (one-liner), I'm loving it!

## Immutability
Another important idea of FP that implies side-effects reducing -- immutable data.
