---
title: Please... no more jQuery...
description: jQuery was our buddy for a long time, but in 2017 it looks like ballast on web pages.
created: 2017-02-12
ogimage: images/posts/please-mo-more-jquery/please-mo-more-jquery-og.jpg
tumb: /images/posts/please-mo-more-jquery/please-mo-more-jquery
categories:
- Libraries
---
jQuery was our buddy for a long time, it helped developers around the world to solve browser incompatibility issues in old dark times. But everything changes and JavaScript incredibly changed compared to 2006. Browser vendors involved in specification improvements and followed it and give devs ability to try experimental platform features. Why might you not need jQuery in 2017?

[jQuery](http://jquery.com/) is a handy library that provides simple API for DOM manipulations, AJAX, animations and a lot more. Also, it solves all edges of old browsers incompatibility, if you know what does it mean to support IE8, you understand what I mean. But why you should use it now, when all these tasks can be solved with vanilla JS and CSS? For example, the size of minified version of jQuery 3 (latest major version now) is more than 80KB! This means that without any line of your code, you want to charge end users for additional traffic. I'll try to discover common jQuery use-cases (according to my experience) and how to do the same things without it.

## Elements selection
The first thing that people learn about jQuery is its simple document elements selection. It is available with `jQuery` or usually used `$` alias function:

```js
const $myElement = $('#my-element');
const $collection = $('.collection');
```

Nowadays it is easy to achieve with native `querySelector` and `querySelectorAll` methods. You can pass any valid CSS selector string to them:

```js
const myElement = document.querySelector('#my-element');
const collection = document.querySelectorAll('.collection');

// Faster more specific methods.
const myElement = document.getElementById('my-element');
const collection = document.getElementsByClassName('collection');
```
As you can see `querySelector` and `querySelectorAll` are universal methods, but sometimes it is better to use specific methods like `getElementById` to be more performant. Anyway `querySelectorAll` implemented natively in browser compared to jQuery analog, and it'll be faster, because not includes if statements.

## Elements iteration
The main difference is that jQuery returns the custom array-like object with a bunch of its specific properties on it. And native selection methods returns `NodeList` -- array-like (includes `length` property) object.

It is common task to iterate though elements collection to do some manipulations. Here is jQuery-way:

```js
$('.collection').each(item => {
  // Do some stuff with item.
});
```

`NodeList` doesn't support and `Array` methods, but you can iterate over it with simple `for`/`while` loop, using `Array.prototype`, convert it to array:

```js
const collection = document.querySelectorAll('.collection');

// For loop.
for (let i = 0; i < collection.length; i++) {
   // Do some stuff with collection[i].
}

// Array method from the prototype.
Array.prototype.forEach.call(collection, item => {
  // Do some stuff with item.
});

// Convert to array.
// 1. Array.from.
const collectionArray = Array.from(collection);

// 2. Spread operator.
const collectionArray2 = [...collection];

// For of loop.
for (let item of collection) {
  // Do some stuff with item.
}
```

First two methods (`for` loop and `forEach`) works starting from IE9. If you won't support them you can use new `for of` loop to convert `NodeList` to an array with `Array.from` the static method as well as with spread operator.

## Elemets attributes/properties
jQuery has few methods to change node class name, set attributes, styles, text content. It may look like this:

```js
const $link = $('a');

$link.addClass('fancy')
  .attr('target', '_blank')
  .css('color', 'red')
  .text('Press Me!')
  .data('my-value', 'someval');
```

The same is simple to do with just a few lines of vanilla JavaScript, but without method chaining:

```js
const link = document.querySelector('a');

link.classList.add('fancy');
link.target = '_blank';
link.style.color = 'red';
link.textContent = 'Press Me!';
link.dateSet.myValue = 'someval';
```

And no library needed for such things :)

## Event listeners

The event is the main "drive" of JavaScript, they helped to survive in the asynchronous world. jQuery provides set of methods to add/remove listeners on DOM nodes, starting from general `on` and `off`, ending more specific like `click`, `mousemove`, etc.

```js
const $menuItems = $('nav > a');
const myHandler = event => console.log(event.target);

$menuItems.click(myHandler);

$menuItems.off('click', myHandler);
```

But in general they are only wrappers on top of native methods:

```js
const menuItems = document.querySelectorAll('nav > a');
const myHandler = event => console.log(event.target);

// Non-optimal way.
for (let link in menuItems) {
  link.addEventListener('click', myHandler, false);

  link.removeEventListener('click', myHandler);
}

// Better way with event delegation.
const menu = document.querySelector('nav');

const rootHandler = event => {
  if (event.target.tagName !== 'A') {
    return;
  }

  // Do stuff with links.
};

menu.addEventListener('click', rootHandler, false);

menu.removeEventListener('click', rootHandler);
```

As you can see it might require some additional logic to use optimal "event delegation" way, but allow you to pass additional options to the event listener. It may be good to have for example when you add a listener to window scroll event. On mobile devices, if you add empty function as a handler for `scroll` it downgrades scrolling performance. But modern browsers support `passive` listeners, that could be enabled by passing `passive: true` parameter to the listener in options object (more [info](https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md)).

## Show or hide element
jQuery's `show` and `hide` methods just adds `block` and `none` value to elements `display` style.

```js
$('.to-hide').hide();

$('.to-show').show();

$('.to-toggle').toggle();
```

But the better decision is to use CSS for this, and you could support other `display` values:

```css
.flexbox {
  display: flex;
}

.flexbox_hidden {
  display: none;
}
```

They you can just toggle `flexbox_hidden` class name to show/hide element:

```js
const flexbox = document.querySelector('.flexbox');

// Hide.
flexbox.classList.add('flexbox_hidden');

// Show.
flexbox.classList.remove('flexbox_hidden');

// Toggle.
flexbox.classList.toggle('flexbox_hidden');
```

There are another technics to hide node with CSS and the choice depends on context (accessibility, hide with animation).

## Animations
Web animations don't wonder anybody in the modern web, it is must have feature complementary user experience. jQuery gives us simple API to handle animations, but CSS have extremely grown its powers and give us the ability to create complex performant animations and transitions. A simple fade in/out element animation with jQuery:

```js
$('.fading-box').fadeIn(500);

$('.fading-box').fadeOut(500);
```

For such simple action CSS is a much better choice and what is more important it will be more performant:

```css
/* transitions way */
.fading-box {
  opacity: 0;
  transition opacity .5s linear;
}

.fading-box:hover {
  opacity: 1;
}

/* keyframes way */
@keyframes fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.fading-box {
  animation: .5s fade;
}

.fading-box_out {
  animation: .5s fade reverse;
}
```

As you can see, transitions could be used for simple property change and keyframes can keep more complex animations. But CSS animations have one limitation, they are predefined and can't be generated or changed in runtime (it is possible with CSS variables, but support is not good for now). If you need something dynamic you might use [Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Animation) or some animation library like [VelocityJS](http://velocityjs.org/).

## AJAX
Some people argue that they use jQuery to not only manipulate DOM but because it provides the simple method to operate with AJAX requests. Yes, old `XMLHttpRequest` has API that was hard to maintain, but now we have great promise-based [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). It's better to show the code than explain with words:

```js
// jQuery ajax.
$.ajax('some/remote/endpoint')
  .done(() => console.log('success'))
  .fail(() => console.log('error'));

// Fetch API.
fetch('some/remote/endpoint')
  .then(() => console.log('success'))
  .catch(() => console.log('error'));
```
Native code do the same thing as jQuery using new features, like `Promise`. If you are using some JavaScript framework like `Angular` they have own implementation for HTTP requests.

## Libraries and Plugins
Many developers don't see an alternative to using jQuery because for a long time its existence a huge amount of plugins have been written. Some role in this situation also played front-end frameworks like Bootstrap that required jQuery for such components as modal windows, accordions, etc. But from my research, a lot of jQuery plugins haven't been maintained for a long time, used outdated technics to support old browsers or could be completely replaced with a feature from last JS/CSS specifications.

For example, mobile navigation drawer could be implemented with CSS only, the JavaScript needed for additional featured like a11y. Simple sliders, accordions, tabs could be also implemented with styles, the only disadvantage is that it may require additional markup.

Web Components are coming, the specification is supported in most of the modern browsers and I believe that all plugins will be replaced with custom elements in the future.

## Helpful resources
1. [You Don't Need jQuery](https://github.com/oneuijs/You-Dont-Need-jQuery) - jQuery features in vanilla JS examples.
2. [You Might Not Need jQuery](http://youmightnotneedjquery.com/) - native DOM manipulation examples.
3. [MDN JavaScript Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
4. [The Vanilla Javascript Repository](http://www.vanillalist.com/) - curated list of vanille JS libraries and plugins
5. [Custom Elements](https://customelements.io/) - web components catalog.
6. [Polymer Elements](https://elements.polymer-project.org/) - list of web components created by Polymer team.
