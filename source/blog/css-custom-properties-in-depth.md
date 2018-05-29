---
title: CSS Custom Properties in Depth
description: CSS Properties and Values API the vital part of Houdini project. This deep dive demonstrates its power on real examples.
ogimage: images/posts/css-custom-properties-in-depth/css-custom-properties-in-depth-og.jpg
tumb: /images/posts/css-custom-properties-in-depth/css-custom-properties-in-depth
created: 2018-05-30
updated: 2018-05-30
lastmod: 2018-05-30
categories:
- CSS
- Houdini
---
"CSS Properties and Values API Level 1" is a brand new draft for CSS specification module. It gives developers the power to extend stylesheet dictionary. I have already mentioned custom properties in my previous articles: ["Exploring the CSS Paint API"](/blog/css-paint-in-action-bar-chart/) and ["CSS Paint in Action: Bar Chart"](/blog/css-paint-in-action-bar-chart/). But today I want to introduce them in as many details as possible. So let's start our journey into properties and values far depths ⚓!

## What are custom properties?
CSS Properties and Values API is the part of Houdini project that allows **you** as developer create own variables to use later in your styles. The idea behind them is pretty similar to variables we have for many years in SASS, LESS or Stylus. The main difference between preprocessor variables and CSS properties that they are **not** static and existing at compile time only. You can change them in more specific selector block, for example on `:hover` or a `media-query` block. You could access them from JavaScript to read and modify. We will see all those features later in cases.

## How to define and use the custom property?
There is special syntax for all custom properties -- a name of each property should be prefixed with `--` symbols. The name itself should be in lowercase (preferred) or uppercase letters (as CSS built-in properties are case insensitive) delimiter by `-`. As a value, we can use everything we want -- strings, numbers, colors, JavaScript code. Let's create few custom properties:

```css
.element {
  --my-num-prop: 10;
  --string-prop: text;
  --another-string: 'content';
  --length-prop: 100px;
  --js-prop: if (a > b) return 30;
}
```

To use it as the value of any CSS property we have `var` function. We should call `var` and pass variable name in it. Also, we allowed defining default fallback value for that property if it wasn't initialized.

```css
.element {
  --offset: 10px;
  margin: var(--offset, 30px);
}
```

The only thing you should remember is CSS parsing process that means you can't use `:` or `;` outside quotes as they will be used as delimiters by CSS engine.

```css
/* Will be parsed wrongly */
.element {
  --offset: a: something;
}
```

 By default, uninitialized variables have no value until we don't configure another behavior. In this case, the fallback value will be used:

```css
.element {
  /* margin: 30px */
  margin: var(--offset, 30px);
}
```

 And one more important thing -- we can use another property as a default value. And this variable could also have a fallback:

```css
.element {
  /* margin: 30px */
  margin: var(--offset, var(--root-offset, 30px));
}
```

In previous examples, we defined the property on the element itself, but we can use `:root` to create global variables. Root is standing for CSS OM root node that similar to `html` tag.

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

Or use them in media queries and other CSS blocks:

```css
.element {
  --theme-color: white;
  background: var(--theme-color);
}

.element:hover {
  /* background: red */
  --theme-color: red;
}

@media all and (min-width: 1024px) {
  .element {
    /* background: black */
    --theme-color: black;
  }
}
```

## What is the difference between CSS variable and custom property?
Actually, there is no difference between CSS variable and CSS custom property, correctly to call both as custom properties. The only thing is that when we declare a custom property with `CSS.registerProperty`, you will get more control over it. Under more control I mean that you will be able to assign CSS type, set initial value and inheritance.

## Browsers support
If we are speaking about CSS variables, the browsers support is incredible! All "evergreen" one has full support.

![CSS Variables support according to CanIUse.com](/images/posts/css-custom-properties-in-depth/img/caniuse.jpg){js-lazy-load}

Unfortunately, can't say the same about custom properties 😢. Only Chrome and Firefox started initial implementation of the spec.

![CSS Properties and Values browsers implementation status on May 2018](/images/posts/css-custom-properties-in-depth/img/ishoudinireadyyet.jpg){js-lazy-load}

It will be great to be prepared before custom properties will be released in stable browser branch. You can always check the current status of every Houdini feature [here](https://ishoudinireadyyet.com/).

### **Note:**
*Work with `registerProperty` requires you to enable "Experimental Web Platform features"* -- `chrome://flags/#enable-experimental-web-platform-features` *to try it in Chrome.*

![Chrome v66 "Experimental Web Platform features" enabled on chrome://flags](/images/posts/css-custom-properties-in-depth/img/chrome-flags.jpg){js-lazy-load}

## How to register custom property?
To register custom property, you need to use the static `CSS.registerProperty`  method and pass configuration object. The code might look like this:

```js
if ('registerProperty' in CSS) {
  CSS.registerProperty({
    name: '--my-custom-prop',
    syntax: '<color>',
    inherits: true,
    initialValue: 'black'
  });
}
```

So, first of all, we are detecting feature support in our browser, as a part of progressive enhancement. If `registerProperty` not supported in the browser, we still able to use CSS variables in styles. Let's have a closer look at each configuration parameter. The configuration object is required, if we try to call the method without it, we will get JS exception.

### name
This is the only required parameter, if we try to register property without `name` provided we will get an exception -- "*Uncaught TypeError: Failed to execute 'registerProperty' on 'CSS': required member name is undefined.*".

The other thing regarding property name that you must follow the naming rule -- name should start with `--` symbols. The reason for that is to have the ability to use CSS custom properties with CSS pre/post-processors and separate them from built-in CSS properties. If you try to give a name in an incorrect format, you will see the error -- "*DOMException: Failed to execute 'registerProperty' on 'CSS': Custom property names must start with '--'.*".

If a property with that name has been already registered, a browser will throw next error -- "*Failed to execute 'registerProperty' on 'CSS': The name provided has already been registered.*".

### syntax
Syntax stands for our property type definition. Its default value is `*` that is similar to TypeScript `any` type. This means that you can assign any value to your property. The type definition syntax is straightforward -- **<TYPE_NAME>**, where `TYPE_NAME` should be replaced with actual CSS type you want to assign. In our example we used `color` type, that gives ability to assign any CSS color value, for example: `rebeccapurple`, `rgba(0, 0, 0, .5)`, `#ff00ff`, `hls(240, 10%, 50%)`. We will look what types are available later in this article.

Similarly to TypeScript, it is possible to define the union of types and list of arguments. To declare union, we should separate types with `|` as the delimiter:

```js
CSS.registerProperty({
  name: '--my-size',
  syntax: '<length> | <percentage>',
  initialValue: '100%'
});
```

In this example we declare that `--my-size` property accepts length OR percentage types, like `10px`, `3em`, `10vw`, `10%`. If the provided value does not match to those types, the property will use fallback or initial value instead.

To specify a list of values as a type, you should add `+` sign at the end of the type definition, example:

```js
CSS.registerProperty({
  name: '--my-colors',
  syntax: '<color>+',
  initialValue: 'black'
});
```

In this example we want our property to have one or more colors delimited with a comma. If the syntax is invalid browser will throw an error -- "*Failed to execute 'registerProperty' on 'CSS': The syntax provided is not a valid custom property syntax.*".

There are much more possibilities to describe types that unfortunately not supported by the current CSS Custom Properties and Values specification. Hope to see them all in the next specification release 🙏.

### initialValue
You might notice that I have used the `initialValue` parameter in the previous section examples. An initial value is required if the `syntax` was specified as any value different from `*`. If you trying to register the property with some type without providing `initialValue`, you'll face such error -- "*DOMException: Failed to execute 'registerProperty' on 'CSS': An initial value must be provided if the syntax is not '\*'*". Also, initial value should match the type specified as syntax, in another case you will see an error -- "*DOMException: Failed to execute 'registerProperty' on 'CSS': The initial value provided does not parse for the given syntax.*". For `*` syntax type `initialValue` is optional and could have any value:

```js
CSS.registerProperty({
  name: '--my-any-prop',
  syntax: '*',
  initialValue: '10px'
});
```

CSS variables created without `registerProperty` have `initialValue` as well, it is empty by default. That means that if a property weren't initialized, a fallback value would be used.

```css
.element {
  background: var(--theme-color, red);
}
```

The value of `background` will be red, as `--theme-color` wasn't initialized and the initial value is empty. But if we will register our property:

```js
CSS.registerProperty({
  name: '--theme-color',
  syntax: '<color>',
  initialValue: 'blue'
});
```

```css
.element {
  background: var(--theme-color, red);
}
```

The value of the `background` will be blue, as it specified as the initial value for `--theme-color` in property configuration.

The important thing here is that the `initial` keyword. Let me show the code:

```js
CSS.registerProperty({
  name: '--theme-color',
  syntax: '<color>',
  initialValue: 'blue',
  inherits: true
});
```

```html
<section class="red-theme">
  <article class="default-theme"></article>
</section>
```

```css
.red-theme {
  --theme-color: red;
  background: var(--theme-color);
}

.default-theme {
  --theme-color: initial;
  background: var(--theme-color);
}
```

In this example element with class name, `default-theme` will inherit `--theme-color` property and then resets it to the initial value. So its background color will be blue.

### inherits
Inherits is a boolean parameter, that obliviously stands for custom property inheritance from DOM tree. It is `false` by default. The reason for such default is performance, as browser don't need to walk through DOM tree to define which nodes inherit properties. You need to set inheritance to `true` if you want the property to be inherited:

```js
CSS.registerProperty({
  name: '--my-col',
  syntax: '<color>',
  initialValue: 'red',
  inherits: true
});
```

```html
<ul>
  <li>item 1</li>
  <li>item 2</li>
  <li>item 3</li>
</ul>
```

```css
ul {
  --my-col: #ff00ff;
}

li {
  color: var(--my-col, blue);
}
```

In this example, we have a simple unordered list in HTML. Then we assign the value to `--my-col` property that accepts CSS colors. Next, we are using this property for list item text color value with fallback specified as well. Each of items will have `#ff00ff` text color because the property was inherited from `ul` element in the DOM tree.

Actually, CSS variable created in stylesheet only equals to the next registered custom property:

```js
CSS.registerProperty({
  name: '--my-var',
  syntax: '*',
  inherits: true
});
```

## Why we might need a type of custom properties?
There are few cases when we want our custom properties to be strictly typed: value validation, and animations.

### CSS value validation
This is the straightforward use case as if we expect CSS property to have an only valid type. If the type does not match value assignment for the property will be ignored and inherited/initial/fallback value will be used. Also, types could be used in JavaScript, in the main context or in some worklet, like CSS Paint.

```js
CSS.registerProperty({
  name: '--theme-color',
  syntax: '<color>',
  initialValue: 'blue'
});
```

```css
.dark-theme-section {
  --theme-color: 1;
}
```

We declared `--theme-color` property that accepts only CSS color as a value. Then in our stylesheet we assigned `1` as the value for that property. As `1` is not valid color value, the property will use initial value. Let's we try to get the value in JavaScript:

```js
const section = document.querySelector('.dark-theme-section');
const styles = getComputedStyle(section);
const themeColor = styles.getPropertyValue('--theme-color');

console.log(themeColor); // "blue"


const styleMap = section.computedStyleMap();
const typedValue = styleMap.get('--theme-color');

console.log(typedValue); // CSSKeywordValue {value: "blue"}
```

We can access our property value in JS, and the only valid one will be used.

### Animations
If we try to animate CSS variables in styles with `transition` or `animation` it won't work, the value will be changed at 50% timeframe point without any smooth interpolation.

```css
.no-smoosh {
  --bg-color: red;
  background: var(--bg-color);
  transition: --bg-color .3s linear;
}

.no-smoosh:hover {
  --bg-color: blue;
}
```

This happens because for browsers custom property without the type is just string and it has no idea how to interpolate one string into another. But browser already has the internal functionality to interpolate built-in CSS value of different types, like length, percentage, color, etc. So to make custom property soothly animated, we need to tell the browser what type to expect for particular custom property:

```js
CSS.registerProperty({
  name: '--bg-color',
  syntax: '<color>',
  initialValue: 'red'
});
```

```css
.smoosh {
  background: var(--bg-color);
  transition: --bg-color .3s linear;
}

.smoosh:hover {
  --bg-color: blue;
}
```

In this case, the `background` will be smoothly changed from red to blue.

## What types are available?
Unfortunately, not all CSS types available for custom property syntax in the current spec version. For now, it is limited to the next list:

- `length`
- `number`
- `percentage`
- `length-percentage`
- `color`
- `image`
- `url`
- `integer`
- `angle`
- `time`
- `resolution`
- `transform-list`
- `custom-ident`

There are interfaces for `<url>` and `<image>` in Blink core, but they still in development. That is why it is impossible to test them now. And it seems that specification for this types usage could be slightly changed in the future.

All of this types could be used as input arguments in Houdini worklets, for example, the CSS Paint API.

## Conclusion
Houdini "Custom Properties and Values" is the very powerful specification that opens a vast field for experiments. Working on this post, I realized that topic and amount of info and ideas I want to share is too big. That is why I decided to split it at least into two parts. In the next part of the article, I will make the in-depth overview of each available type. Hope you enjoyed our journey to the deep of the spec 😊! Read & share! See you in the future 👨‍⚕️👲🚙.
