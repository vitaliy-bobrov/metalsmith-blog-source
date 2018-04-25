---
title: CSS Custom Properties in Depth
description: Deep dive into CSS Properties and Values API the important part of Houdini project demonstrated on real examples.
ogimage: images/posts/css-custom-properties-in-depth/css-custom-properties-in-depth-og.jpg
tumb: /images/posts/css-custom-properties-in-depth/css-custom-properties-in-depth
created: 2018-04-24
draft: true
categories:
- CSS
- Houdini
---
CSS Properties and Values API Level 1 is a brand new draft for CSS specification module that allows developers to extend stylesheet dictionary. I have already mentioned custom properties in my previous articles: ["Exploring the CSS Paint API"](/blog/css-paint-in-action-bar-chart/) and ["CSS Paint in Action: Bar Chart"](/blog/css-paint-in-action-bar-chart/), but today I want to introduce them in as much details as possible. So let's start our journey into properties and values far dephts ⚓!

## What are custom properties?
CSS Properties and Values API is the part of Houdini project that allows you as developer create own variables to use later in your styles. The idea behing them is pretty similar to variables we have for many years in SASS, LESS or Stylus. The main difference between preprocessor variables and CSS properties that the are not static and existing at compile time only. You can change them in more specific selector block, for example on `:hover`. You could access them from JavaScript to read and modify. We will see all those features later in exapmles.

## How to define and use custom property?
THere is special syntax for all custom properties -- name of each property should be prefixed with `--` symblols. The name it self should be in lowercase (prefered) or uppercase (as CSS built-in properties are case insensitive) letters delimiter by `-`. As a value we can use everything we want -- strings, numbers, colors, JavaScript code. Let's create our first custom property:

```css
.element {
  --my-num-prop: 10;
  --string-prop: text;
  --another-string: 'content';
  --length-prop: 100px;
  --js-prop: if (a > b) return 30;
}
```

To use it as the value in any CSS property we have `var` function. We should call `var` and pass variable name in it. Also we allowed to define default fallback value for that property if it wasn't initialised.

```css
.element {
  --offset: 10px;
  margin: var(--offset, 30px);
}
```

The only thing you should remember is CSS parsing process that means you can't use `:` or `;` outside a quotes as they will be used as delimiters by CSS engine.

```css
/* Will be parsed wrongly */
.element {
  --offset: a: something;
}
```

 By default unintialised variables has no value until we don't configure another behavior. In this case fallback value will be used:

```css
.element {
  /* margin: 30px */
  margin: var(--offset, 30px);
}
```

 And one more important thing -- we can use another property as default value. And this variable could also have fallback:

```css
.element {
  /* margin: 30px */
  margin: var(--offset, var(--root-offset, 30px));
}
```

In previos examples we defined property on itself, but we can use `:root` to create global variables. Root is stands for CSS OM root node that similar to `html` tag.

```css
:root {
  --theme-color: blue;
}

.element {
  /* blue */
  background: var(--theme-color, red);
}
```

CSS custom properties also use cascade, that means we can override them by increasing CSS specificity:

```css
.element {
  --theme-color: white;
  background: var(--theme-color);
}

.element.dark {
  /* background: black */
  --theme-color: black;
}
```

## What is the difference between CSS variable and custom property?

## How to register custom property?

By default custom propeties don't inherit value according to DOM, like it is possible for some CSS built-ins. We can change that with custom configuration in JS.

## What types are available?

## What types could be used as CSS Paint API `inputArguments`?

