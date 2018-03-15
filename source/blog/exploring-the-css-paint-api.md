---
title: "Exploring the CSS Paint API"
description: What is CSS Paint API and how to start using it in real projects.
ogimage: images/posts/exploring-the-css-paint-api/exploring-the-css-paint-api-og.jpg
tumb: /images/posts/exploring-the-css-paint-api/exploring-the-css-paint-api
created: 2018-03-15
draft: false
categories:
- CSS
- Houdini
---
CSS Paint API is the first part of Houdini project that is available in stable browser. It was added into Chrome 65 on March 6th. That is why it is a good time to try it out and start experimenting. I gonna to show some possible practical use-cases that could be applied to a production project.

## What is Houdini?
Before we start exploration of CSS Paint API, let me made short intro to Houdini project. I will not get into too much details, but will provide you with links to resources to get knowing more if you want.

So Houdini is the set of APIs that allows you to interact with CSS engine internals. Unfoutunately, until this time we are limited to works with some part of CSSOM (CSS Object Model) via JavaScript. So we can try to polyfill CSS with JS butafter browser render stage. And after changes browser need to perform rendering of screen again. But with Houdini we can extend styles in the same way we do with JS.

Houdini APIs are here to work with CSS parser, CSSOM, cascade, layout, paint and composite rendering stages. There are two main groups of the API: CSS properties & values and wroklets. And worklets covers render states access: layout, paint and composite. While properties and values focused on parser extension, work with CSSOM and cascade. You can find more information about it [here](https://developers.google.com/web/updates/2016/05/houdini).

## CSS Paint Worklet
CSS Paint API is the kind of worklets and how you could understand from its name it works with paint rendering proccess. What it does? It allows you to create custom CSS function to draw an image as background with JavaScript. And then use this function for any CSS property that expect image. For example you can use it for `background-image`, `border-image` or `list-style-image`. But more exiting that it also could be use for custom CSS property, we will come back to them later.

For drawing picture with JavaScript you allowed to use limited version of Canvas API. Why limited? For security reasins you are not able to read pixels from image or render text. But you can draw arcs, rectangles, paths, etc.

### How to use CSS paint in styles?
To use custom paint in your stylesheets you need to use `paint` function, and pass your paint name, as well as any required arguments next. Here the exapmle how it could look like:

```css
div {
  background-image: paint(my-custom-paint);
}
```

In the example above we are using custom paint with name `my-custom-paint`, next lets imagine that it allows us to pass additional arguments inside, like color:

```css
div {
  background-image: paint(my-custom-paint, #fff);
}
```

Looks similar too what we have in some CSS built-in functions, like `linear-gradient`:

```css
div {
  background-image: linear-gradient(to bottom, #fff, #000);
}
```

As `paint` is just a value of CSS declaration it will be easy to fallback it for old browsers with solid color or image:

```css
.paint-with-fallback {
  background-image: url('./my-paint-fallback.jpg');
  background-image: paint(my-custom-paint);
}
```
In this case browsers that don't support CSS Paint API will ignore last `background-image` declaration and use some static image instead.

But if we will create some wide-used painter it will be great to automate fallback insertion, as humans could forget about it. And I have great news for you, PostCSS could do it for us with a plugin. To write such plugin we don't need a lot lines of code, PostCSS provide us with a bunch of handy helper toolsto iterate through CSS AST (Abstract Syntax Tree) and manipulate it. Below is the exaple of such plugin that replaces custom paint with static fallback value passed as an `fallbackValue` option:

```js
const postcss = require('postcss');

module.exports = postcss.plugin(
  'postcss-fallback-my-paint',
  options => {
    return css => {
      css.walkRules(rule => {
        rule.walkDecls(decl => {
          const value = decl.value;

          if (value.includes('my-custom-paint')) {
            decl.cloneBefore({value: options.fallbackValue});
          }
        });
      });
    };
  }
);
```

This plugin will walk through all css rules and then all declarations inside them. The look for `my-css-paint` calls and insert clones declaration before with value replaced to fallback. Not the 🚀 science, isn't it?

### How to create custom CSS paint?
So how to create custom CSS paint? It is just three steps:

1. Declare a custom paint class
2. Register paint
3. Load worklet

So first of all we want to declare CSS Paint class. It should be JavaScript class with `paint` method. We will explore this method and its arguments later, for now just look on basic implementation:

```js
class MyCustomPainter {
  paint(ctx, geom, props, args) {
    // paint implementation.
  }
}
```

After that we need to registed newly defined painter:

```js
registerPaint('my-custom-paint', MyCustomPainter);
```

We using `registerPaint` function and pass paint name as the first argument and our class reference as the second. Here I want to notice that our paint module file with class and registration call has separate context. That means that we can't access any function or variable available in global browser scope or even load any dependency script. The only function available there globally is `registerPaint`. If you will try to import synchronosly ot asynchronously any script browser will block it and show you an error:

```js
// my-custom-paint.js

import { lib } from './my-lib.js'

// Error

import('./another-lib.js').then();

// Error.
```

Next the last step is to load worklet, so after that you will be able to use it in your stylesheets:

```js
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('my-custom-paint.js');
}
```
