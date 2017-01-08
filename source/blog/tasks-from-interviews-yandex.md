---
title: Tasks from interviews - Yandex
description: Resolving tasks received before Yandex interview on JavaScript developer position.
ogtitle: Tasks from interviewsи - Yandex
ogdescr: Resolving tasks received before Yandex interview on JavaScript developer position.
ogimage: images/posts/tasks-from-interviews-yandex-og.jpg
tumb: /images/posts/tasks-from-interviews-yandex
author: me
draft: false
categories:
- Tasks
tags:
- JavaScript
- Interviews
comments: true
---
A lot of companies provide interviewers with some programming tasks to solve before face-to-face or Skype interview with their employes. Sometimes they could ask you to solve some task during the interview online. I think many of specialists nowadays know that and looking for such usual tasks while preparation to interview.

I want to share some tasks that I've received before Skype interview in big company called Yandex on position of JavaScript developer. Of course my solution may not be that best one, if you have any concerns about it feel free to add yours in the comments to this post.

## Task 1
_**Display to browser developer console the phrase: "I can count: 1, 2, 3" without using digits and property `length` in your code. Few solution variants will be a plus.**_

So as we are limited to this rules, first of all I consider to create some function that takes zero and outputs needed string:

```js
function countToConsole(zero) {
  var count = [++zero, ++zero, ++zero].join(', ');

  console.log('I can count: ' + count);
}
```

As you can see the code is pretty simple. It creates array with incremented zero values, than creates string from it. Next thing to do is to create zero without numbers and `length` property. My first idea was to use JavaScript types convertion:

```js
var zeroFromBool = + false;
var zeroFromString = + '';
var zeroFromUndefined = + !!undefined;
var zeroFromNull = + null;
var zeroFromNaN = + !!NaN;
```

It is realy simple, but notice that we can't use construction `+ undefined`, because it return `NaN`. Next idea was to use `Number` constructor:

```js
var zeroNumberString = Number('');
var zeroNulmberNull = Number(null);
```

Another variant wasn't so trivial in my taste. I decided to use `Math`:

```js
var zeroFromMath = Math.floor(Math.random());
```

Also as we limited only not to use `length`, we can use method that return numbers:

```js
var zeroFromIndexOf = 'a'.indexOf('a');
```

Even there are something from ES2015 that can be used:

```js
var zeroFromMap = new Map().size;
```

This was fun, but I think you'll never use such things in real project. I hope :)

## Task 2
_**Provide implementation of function `getNumbers`, that will output such results after call:**_
```js
getNumbers();     // 1
getNumbers()();   // 2
getNumbers()()(); // 3
```

```js
function getNumbers() {
  return (function counterMaker(sum, n) {

    console.log(sum + n);

    return function counter() {
      return counterMaker(n);
    }
  })(0, 1);
}
```

## Task 3
