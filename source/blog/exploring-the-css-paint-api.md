---
title: Exploring the CSS Paint API
description: What is CSS Paint API and how to start using it in real projects.
ogimage: images/posts/exploring-the-css-paint-api/exploring-the-css-paint-api-og.jpg
tumb: /images/posts/exploring-the-css-paint-api/exploring-the-css-paint-api
created: 2018-03-19
categories:
- CSS
- Houdini
---
CSS Paint API is the first part of Houdini project that is available in the stable version of the browser. It Google Chrome team added it to Chrome 65 on March 6th. That is why it is an excellent time to try it out and start experimenting. I want you to get started and start own experimenting with it.

## What is Houdini?
Before we start the exploration of CSS Paint API, let me made a short intro to Houdini project. I will not get into too many details but will provide you with links to resources to learn more if you want.

So Houdini is the set of APIs that allows you to interact with CSS engine internals. Unfortunately, until this time we are limited to works with some part of CSSOM (CSS Object Model) via JavaScript. So we can try polyfill CSS with JS but after browser renders stage. And after changes browser needs to perform rendering of the screen again. But with Houdini, we can extend styles in the same way we do with JS.

Houdini APIs are here to work with CSS parser, CSSOM, cascade, layout, paint and composite rendering stages. There are two main groups of the API: CSS properties & values and worklets. And worklets cover renders states access: layout, paint, and composite.  While properties and values focused on parser extension, work with CSSOM and cascade. You can check browsers implementation status for each API [here](https://ishoudinireadyyet.com/) and more information about it [here](https://developers.google.com/web/updates/2016/05/houdini).

## CSS Paint Worklet
CSS Paint API is the kind of worklets and how you could understand the name it works with paint rendering process. What does it do? It allows you to create custom CSS function to draw an image as background with JavaScript. And then use this function for any CSS property that expects image. For example you can use it for `background-image`, `border-image` or `list-style-image`. But more exciting that it also could be used for custom CSS property, we will come back to them later.

For drawing pictures with JavaScript, you allowed using the limited version of Canvas API. Why limited? For security reasons, you are not able to read pixels from an image or render text. But you can draw arcs, rectangles, paths, etc.

### Why we need CSS Paint API?

There are few use cases that I have in my mind for now:
1. CSS polyfills -- of course we could write a polyfill for CSS with JavaScript, but it is not a good idea in case of usability and performance. You can read some thoughts about that [here](https://philipwalton.com/articles/the-dark-side-of-polyfilling-css/). But CSS Paint is a good candidate for that, for example, take a look on `conic-gradient` [polyfill example](https://lab.iamvdo.me/houdini/conic-gradient).

2. Reduce DOM nodes number -- sometimes we need to add dummy DOM nodes, like `span` just for visuals. Also, some of the animations may require additional elements. Look for painter that implements Material Design "ripple" [animation](https://lab.iamvdo.me/houdini/ripple). In original Material Design library, it creates two additional `span` elements for that animation and with worklet no need to do so. Now imagine you have ten buttons with "ripple" effect on the page, and CSS paint saves you twenty DOM nodes for that.

3. Fancy backgrounds -- you can create some kind of new experience for end users with unusual patterns and backgrounds. And good thing here that they will not affect performance and could be used as a part of progressive enhancement.

### How to use CSS paint in styles?
To use custom paint in your stylesheets you need to use `paint` function, and pass your paint name, as well as any required arguments next. Here the example how it could look like:

```css
div {
  background-image: paint(my-custom-paint);
}
```

In the example above we are using custom paint with name `my-custom-paint`, next let's imagine that it allows us to pass additional arguments inside, like color:

```css
div {
  background-image: paint(my-custom-paint, #fff);
}
```

Looks similar too what we have with some CSS built-in functions, like `linear-gradient`:

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

Or we can check browser support in CSS:

```css
.paint-with-fallback {
  background-image: url('./my-paint-fallback.jpg');
}

@supports(background-image: paint(id)) {
  .paint-with-fallback {
    background-image: paint(my-custom-paint);
  }
}
```

In this case, browsers that don't support the CSS Paint API will ignore last `background-image` declaration and use some static image instead.

But if we will create some wide-used painter, it will be great to automate fallback insertion, as humans could forget about it. And I have great news for you, PostCSS could do it for us with a plugin. To write such plugin, we don't need a lot of lines of code. PostCSS provide us with a bunch of handy helper tools to iterate through CSS AST (Abstract Syntax Tree) and manipulate it. Below is the example of such plugin that replaces custom paint with a static fallback value passed as a `fallbackValue` option:

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

This plugin will walk through all CSS rules and then all declarations inside them. The look for `my-css-paint` calls and insert clones declaration before with value replaced to fallback. Not the 🚀 science, isn't it?

### How to create custom CSS paint?
So how to create custom CSS paint? It is just three steps:

1. Declare a custom paint class
2. Register paint
3. Load worklet

So, first of all, we want to declare CSS Paint class. It should be JavaScript class with `paint` method. We will explore this method and its arguments later, for now just look on basic implementation:

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

We were using `registerPaint` function and pass paint name as the first argument and our class reference as the second. Here I want to notice that our paint module file with class and registration call has separate context. That means that we can't access any function or variable available in global browser scope or even load any dependency script. The only function available there globally is `registerPaint`. If you try to import synchronously or asynchronously any script browser will block it and show you an error:

```js
// my-custom-paint.js

import { lib } from './my-lib.js' // Error.

import('./another-lib.js').then(); // Error.
```

Next, the last step is to load worklet, so after that, you will be able to use it in your stylesheets:

```js
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('my-custom-paint.js');
}
```

First, we are checking if `paintWorklet` available in browser and then register our custom paint calling the only available method on `CSS.paintWorklet` called `addModule`. It accepts one parameter -- path to our worklet JavaScript file. Here you can also opt-in with JavaScript-based fallback for CSS Paint with additional `else` statement.

Here how should look final result:

```js
// my-custom-paint.js

class MyCustomPainter {
  paint(ctx, geom, props, args) {
    // paint implementation.
  }
}

registerPaint('my-custom-paint', MyCustomPainter);
```

```js
// script loaded on page - script.js

if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('my-custom-paint.js');
}
```

## Practice
After the introduction to Paint API, the best idea is to try it. Let's start with the basic example -- create painter that will draw few circles as background. To get started let's define a class for paint and register it:

```js
// paint.js

class CirclesPainter {
  paint(ctx, geom) {
    const offset = 10;
    const size = Math.min(geom.width, geom.height);
    const radius = (size / 4) - offset;
    const point = radius + offset;

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = `rgb(0, ${Math.floor(255 - 42.5 * i)}, ${Math.floor(255 - 42.5 * j)})`;

        ctx.beginPath();
        ctx.arc(point + (i * (point * 2)), point + (j * (point * 2)), radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

registerPaint('circles', CirclesPainter);
```

We created `CirclesPainter` class with the `paint` method. This method accepting two arguments: `ctx` which is our canvas context and `geom` object that consists of 2 properties. `geom` contains `width` and `height` of our canvas surface. Then using our context, we draw four circles inside loops and fill them with some shades of blue. And finally we load our worklet on the page:

```js
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('paint.js');
}
```

To use it we created simple `div` with class name `circles` and added next rules to our stylesheet:

```css
.circles {
  overflow: hidden;
  height: 0;
  padding-top: 50%;
  background: #000;
  background: paint(circles);
}
```

So we make it square and add black color as a fallback for old browsers. That is it! You can check [result](https://vitaliy-bobrov.github.io/css-paint-demos/hello-world/) and [code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/hello-world) on GitHub. Here is the demo:

[](youtube:9ZVg3lrqIfg)

One thing I want to mention now, we haven't added any resize event listener, but browser calls `paint` method automatically on any layout changes. Current Chrome implementation uses main UI thread for paint rendering, but in the future, it will use a separate thread. You can imagine some heavy animations or backgrounds that have zero effect on the main thread. It will be enormous performance boost!

Your backgrounds could be responsive, and this responsiveness depends on element size itself without any listeners on `resize` events. Until `element queries` are still proposal you can generate different picture depending on element size. Try out [this exaple](https://vitaliy-bobrov.github.io/css-paint-demos/responsive/) with [source code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/responsive). When the element changes its size, we fill our circles with another color.

All this nice, but next I want to make our paint configurable. So let me introduce few CSS variables:

- `--circles-offset` -- to control the distance between circles
- `--circles-count` -- for the number of circles to render
- `--circles-opacity` -- to change circles opacity

With those variables, we can create some kind of pattern that could be changed over the time. To access CSS variables in our painter class, we need to define the static property called `inputProperties`. It should be an `Array` of CSS properties and variables we want to access in `paint` method. On every property from the array change browser will call render for us without any additional line of code. Below is the updated `CirclesPainter`:

```js
class CirclesPainter {
  static get inputProperties() {
    return [
      '--circles-offset',
      '--circles-count',
      '--circles-opacity'
    ];
  }

  paint(ctx, geom, props) {
    const offset = parseInt(props.get('--circles-offset').toString(), 10) || 0;
    const count = parseInt(props.get('--circles-count').toString(), 10) || 2;
    const opacity = parseFloat(props.get('--circles-opacity').toString()) || 1;
    const size = Math.min(geom.width, geom.height);
    const radius = Math.max(Math.round(((size / count) - offset * 2) / 2), 10);
    const point = radius + offset;

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        ctx.fillStyle = `rgba(0,
          ${Math.floor(255 - 42.5 * i)},
          ${Math.floor(255 - 42.5 * j)},
          ${opacity})`;

        ctx.beginPath();
        ctx.arc(point + (i * (point * 2)), point + (j * (point * 2)), radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

registerPaint('circles', CirclesPainter);
```

So we added the getter for `inputProperties`, and it returns the list of CSS variable we want to use. Then we get access to all properties we subscribed with `props` argument. It contains CSS map of properties with values. We call `get` method with variable name to get its value as a `string`. Also, we define some defaults to have values even if they are not specified in styles. And we used this value to make circles rendering dynamic.

We should update styles with our variables:

```css
.circles {
  --circles-count: 2;
  --circles-offset: 10;
  --circles-opacity: 1;
  overflow: hidden;
  height: 0;
  padding-top: 50%;
  background: #000;
  background: paint(circles);
}
```

Check [code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/circles-with-params) and [result](https://vitaliy-bobrov.github.io/css-paint-demos/circles-with-params/) here.

[](youtube:4WJDY1HNdcg)

For GitHub demos I added a simple script to connect CSS variables with input controls, you can find it [here](https://github.com/vitaliy-bobrov/css-paint-demos/blob/master/src/js/update-css-variable.js).

So now we can modify our rendering parameters in the runtime just updating variables with CSS or JavaScript. But if we look on built-in CSS functions like `linear-gradient`, they accepted to pass additional parameters to a function itself:

```css
.gradient-bg {
  background: linear-gradient(to top, #fff, #000);
}
```

Could we also achieve the same behavior for custom paint? And the answer is - YES! For that, we need to use another Houdini API that still exists as an experiment in Chrome. It called CSS Typed OM, and it allows you to use built-in CSS engine types like colors, images, length, etc. And then we can pass them as arguments to the `paint` function.

As feature still experimental now, we need to enable "Experimental Web Platform features" flag in Chrome. Go to `chrome://flags/#enable-experimental-web-platform-features` and enable it.

After that, we should add a new static property to our paint class -- `inputArguments`. Like `inputProperties` it subscribes to any changes to listed arguments but should contain an array of CSS types. Let replace CSS variable with arguments:

```js
class CirclesPainter {
  static get inputArguments() {
    return [
      '<number>',    // offset
      '<number>',    // number of circles
      '<percentage>' // opacity
    ];
  }

  paint(ctx, geom, props, args) {
    const offset = args[0].value;
    const count = args[1].value;
    const opacity = args[2].value / 100;
    const size = Math.min(geom.width, geom.height);
    const radius = Math.max(Math.round(((size / count) - offset * 2) / 2), 10);
    const point = radius + offset;

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        ctx.fillStyle = `rgba(0,
          ${Math.floor(255 - 42.5 * i)},
          ${Math.floor(255 - 42.5 * j)},
          ${opacity})`;

        ctx.beginPath();
        ctx.arc(point + (i * (point * 2)), point + (j * (point * 2)), radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}
```

So our `CirclesPainter` now includes `inputArguments` list that contains three parameters: `<number>`, `<number>` and `<percentage>`. You might mention syntax for CSS types -- `<type name>`. Also you can accept types union similar way as it possible in TypeScript -- `<number | percentage>`.You can find all available types in "CSS Values and Units" specification [draft](https://drafts.csswg.org/css-values-4).

Then in `paint` method we got `args` parameter that similar to JavaScript function `arguments` object, but it is just `Array` that contains `CSSUnitValue` objects. Each of unit objects consists of two properties `value` and `unit`. So in our example, we accessed all the value of each argument. And we should modify our CSS to use it:

```css
.circles {
  overflow: hidden;
  height: 0;
  padding-top: 50%;
  background: #000;
  background: paint(circles, 2, 10, 100%);
}
```

Check out [code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/circles-with-args) and [result](https://vitaliy-bobrov.github.io/css-paint-demos/circles-with-args/) here.

## Animations
This was cool, but how we can create animations for a painter? As I told before, our worklets execute in a separate context, and there is no `requestAnimationFrame` or even `setTimeout` functions. How to implement animations? The first solution is to use CSS variables. Let's try to animate them with CSS:

```css
.circles {
  --circles-count: 2;
  --circles-offset: 10;
  --circles-opacity: 1;
  overflow: hidden;
  height: 0;
  padding-top: 50%;
  background: #000;
  background: paint(circles);
}

.circles:hover {
  animation: opacify 0.3s;
}

@keyframes opacify {
  from {
    --circles-opacity: 1;
  }

  to {
    --circles-opacity: 0;
  }
}
```

And... this solution won't work as we expect. It just switches opacity from one to zero at 50% point. But why? And the answer is simple, all CSS variable are just strings, they are similar to variables in SASS or LESS -- variables are replaced with values with simple string interpolation. To animate some CSS property browser need to apply interpolation function, but it doesn't know how to interpolate one string to another. It has the only built-in functionality to animate colors, length, numbers, but not for strings. That is why it just switch value at 50%. In this case, we can animate variables with JavaScript using `requestAnimationFrame`. Such script could look like this:

```js
const canvas = document.querySelector('.circles');
let start = performance.now();

canvas.addEventListener('mouseenter', event => {
  canvas.classList.add('animating');
  start = performance.now();

  requestAnimationFrame(function raf(now) {
    const count = Math.floor(now - start);
    const rawValue = canvas.style.getPropertyValue('--circles-opacity').trim();
    const value = (parseFloat(rawValue) * 100 - 3) / 100;

    canvas.style.setProperty('--circles-opacity', value);

    if(count > 300) {
      canvas.classList.remove('animating');
      canvas.style.setProperty('--circles-opacity', 0);

      return;
    }

    requestAnimationFrame(raf);
  })
})
```

Not so good, could we do it better? Yes, with Custom Properties API. This API also under the flag in Chrome now, so don't forget to enable it. It allows us to register custom CSS property with syntax similar to variables, but this time with CSS type assigned to it. So browser will have an idea about how to animate it, and we can use CSS animations and transition for that!

So to register custom property we need to call `CSS.registerProperty` and pass options object:

```js
CSS.registerProperty({
  name: '--circles-opacity',
  syntax: '<percentage>',
  inherits: false,
  initialValue: '100%'
});
```

As you can see we need to give the property the name with `name` option. Then we specify its type with `syntax` property, and in addition, we say that it won't be inherited by children nodes and initial value as 100%.

After that we can use our newly created custom property in the stylesheet:

```css
.circles {
  --circles-count: 2;
  --circles-offset: 10;
  --circles-opacity: 100%;
  overflow: hidden;
  height: 0;
  padding-top: 50%;
  background: #000;
  background: paint(circles);
  transition: --circles-opacity 0.3s ease;
}

.circles:hover {
  --circles-opacity: 0%;
}
```

[](youtube:VC6XgOcTHW4)

Now we can use `transition` to change circles opacity smoothly. Check out [code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/circles-animation-with-custom-property) and [result](https://vitaliy-bobrov.github.io/css-paint-demos/circles-animation-with-custom-property/) here.

## Conclusion
Today to just got started with CSS Paint API exploring how to create own one, how to use input properties and arguments, CSS variables and custom properties, and how to animate it. In the next article, I'm going to implement more production ready examples using the knowledge we got with that article. If you are reading this article using latest Chrome you might mention that I am using custom paint to make Material Design background, you can check it [here](https://vitaliy-bobrov.github.io/css-paint-demos/md-bg/) and take a look on [code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/md-bg). Try to experiment with CSS Paint API yourself!

### Resources

- [Developers Google](https://developers.google.com/web/updates/2018/01/paintapi)
- [Houdini Drafts](https://drafts.css-houdini.org/css-paint-api/​)
- [W3C CSS Paint Draft](https://www.w3.org/TR/css-paint-api-1/​)
- [Demos](https://lab.iamvdo.me/houdini/)
- [My demos](https://vitaliy-bobrov.github.io/css-paint-demos/​)
