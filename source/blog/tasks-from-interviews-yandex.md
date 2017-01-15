---
title: Tasks from interviews - Yandex
description: Resolving tasks received before Yandex interview on JavaScript developer position.
ogimage: images/posts/tasks-from-interviews-yandex-og.jpg
tumb: /images/posts/tasks-from-interviews-yandex
categories:
- Tasks
tags:
- JavaScript
- Interviews
---
A lot of companies provide interviewers with some programming tasks to solve before face-to-face or Skype interview with their employees. Sometimes they could ask you to solve some task during the interview online. I think many of specialists nowadays know that and looking for such usual tasks while preparation to interview.

I want to share some tasks that I've received before Skype interview in a big company called Yandex on the position of JavaScript developer. Of course, my solution may not be that best one, if you have any concerns about it feel free to add yours in the comments to this post.

## Task 1
_**Display to browser developer console the phrase: "I can count: 1, 2, 3" without using digits and property `length` in your code. Few solution variants will be a plus.**_

So as we are limited to this rules, first of all, I consider to create some function that takes zero and outputs needed string:

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

It is really simple, but notice that we can't use construction `+ undefined`, because it return `NaN`. Next idea was to use `Number` constructor:

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

This was fun, but I think you'll never use such things in the real project. I hope :)

## Task 2
_**Provide implementation of function `getNumbers`, that will output such results after call:**_
```js
getNumbers();     // 1
getNumbers()();   // 1 2
getNumbers()()(); // 1 2 3
```
We need create function that can be called multiple times and save some value inside it. This mean that we need to return new function every time we call `getNumbers`. Also this function should create closure to store number to inrement it. Here is the implementation of function that creates closure and return another function to call itself:

```js
function counterMaker(n) {

  console.log(n++);

  return function counter() {
    return counterMaker(n);
  }
}
```

`counterMaker` outputs current number to browser console and increments it at the same time. Then it returns another function `counter` to invoke `counterMaker` again. But in this case, we need to pass initial value `1` as function argument first time we call `counterMaker` function. To achieve this we use [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) - _Immediately Invoked Function Expression_ and pass the initial value to it. Here is the final `getNumbers` implementation:

```js
function getNumbers() {
  return (function counterMaker(n) {

    console.log(n++);

    return function counter() {
      return counterMaker(n);
    }
  })(1);
}

```

## Task 3
_**Write a function that defines that the passed string is a palindrome. Example:**_

```js
isPalindrome('Кayak');               // true
isPalindrome('Was it a cat I saw?'); // true
isPalindrome('Do geese see God?');   // true
isPalindrome('programmer');          // false
```

This one is the simple one. We need to convert a string to one case, remove all special characters and then compare with its reversed version. In my case, I decided to convert a string to lower case. Then I lived only letter characters in it. And finally convert it to `Array`, reverse and convert back to `String`. Here is resulting function:

```js
function isPalindrome(text) {
  text = text.toLowerCase().replace(/[^a-zA-Z]/g, '');

  return text.split('').reverse().join('') === text;
}
```

## Epilog

As you can see tasks are not really hard to solve, but keep in mind that you need to understand how and why your code works. Knowledge of any framework requires an understanding of JavaScript concepts in general.

If you have ideas for more elegant, short, better solution, feel free to write them in comments. Good luck on interviews!
