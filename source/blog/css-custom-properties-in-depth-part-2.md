---
title: "CSS Custom Properties in Depth: Part 2"
description: Deep dive into CSS Properties and Values API available types with real code examples.
ogimage: images/posts/css-custom-properties-in-depth-2/css-custom-properties-in-depth-2-og.jpg
tumb: /images/posts/css-custom-properties-in-depth-2/css-custom-properties-in-depth-2
created: 2018-06-05
updated: 2018-06-05
lastmod: 2018-06-05
categories:
- CSS
- Houdini
---
Houdini "Custom Properties and Values" spec gives us the strictly typed CSS variables. It has a big potential and as a new technology is pretty unknown field. Today, I'm going to have deep overview of what types available in the first version of the spec, and show the usage on real examples.

The topic splitted into two parts. Now you are reading the second one. You can check out the first part [here](https://vitaliy-bobrov.github.io/blog/css-custom-properties-in-depth/).{post__series}

## Available types
As I have written in the previous part, not all of the types are available for custom properties. In the initial specification we have the only limited set of them. Let me introduce each of available types.

### **Note:**
*Work with `registerProperty` requires you to enable "Experimental Web Platform features"* -- `chrome://flags/#enable-experimental-web-platform-features` *to try it in Chrome.*

### length
Length type stands for CSS sizing values, like pixel, em, rem, vw, vh, etc. We can declare custom property that expects that type with JavaScript:

```js
CSS.registerProperty({
  name: '--size',
  syntax: '<length>',
  initialValue: 0
});
```

If assigned property value will be invalid, initial one will be used.

```css
.block {
  --size: 20;
  width: var(--size); /* computed value 0px. */
  height: var(--size); /* computed value 0px. */
}
```

To make value valid we need to add units:

```css
.block {
  --size: 20px;
  width: var(--size);
  height: var(--size);
}
```

Unfortunately, we can't use CSS variables in functions like `calc` as is. They works as just strings, example below won't work as expected:

```css
.block {
  --size-variable: 20px; /* Not registered as <length>. */
  width: calc(50vw - var(--size-variable));
  height: var(--size-variable);
}
```

But with custom property it works like a charm:

```css
.block {
  --size: 20px;
  width: calc(50vw - var(--size)); /* 50vw - 20px. */
  height: var(--size);
}
```

Examples above look pretty similar to the variables usage in SASS. But you should remember that in SASS variables are static and replaced on compile time.

```scss
.block {
  $size: 20px;
  width: $size;
  height: $size;
}
```

But we can access and dynamicaly change custom properties with few lines of JS:

```js
const el = document.querySelector('.block');
const styleMap = el.computedStyleMap();
const computedProp = styleMap.get('--size');
console.log(computedProp);
// CSSUnitValue {value: 20, unit: "px"}

el.style.setProperty('--size', new CSSUnitValue(computedProp.value, 'em'));

const propValue = el.style.getPropertyValue('--size');
console.log(propValue);
// "20em"

console.log(CSSUnitValue.parse(propValue));
// CSSUnitValue {value: 20, unit: "em"}

const attributeProp = el.attributeStyleMap.get('--size');

console.log(attributeProp);
// CSSUnparsedValue {0: "20em", length: 1}

console.log(CSSUnitValue.parse(attributeProp));
// CSSUnitValue {value: 20, unit: "em"}

console.log(el.computedStyleMap().get('--size'));
// CSSUnitValue {value: 288, unit: "px"}
```

What is going on? We are using `computedStyleMap` method on DOM node to get resolved custom property. To assign new value we use `style.setProperty`, that creates property declaration inline. Then we use `style.getPropertyValue` that returns the string representation. As now we have property declared in style attribute we can use `attributeStyleMap` that returns unparsed value. Both `computedStyleMap` and `attributeStyleMap` are properties sets, but `computedStyleMap` is readonly. Resolved length property always return pixels value.

Manipulations with CSS units, like parsing, converting or creating values are part of CSS Typed OM specification. It is separate huge topic to sepak about. You can get overview from [this article](https://developers.google.com/web/updates/2018/03/cssom).

### percentage
Usully working with responsive web design (RWD) we trying to avoid pixel dependent units. Instead them we prefer relative ones, like percentages. Luckily we have ability to declare percentage syntax for custom properties.

```js
CSS.registerProperty({
  name: '--lightness',
  syntax: '<percentage>',
  initialValue: '0%'
});
```

Please note that for unit values, like length or percentace you are not allowed to use zero value without units. It might be confusing, because CSS allowes you to do so. Even more it is kind of a good practice to use zero without units, because `0px === 0em === 0%`. That is why in the `--lightness` property definition the initial value specified as `0%` not just `0`.

One of the great examples where custom properties really shine -- the control of the part of a CSS declaration. Let me show it:

```css
.link {
  --lightness: 50%;
  --saturation: 50%;
  color: hsl(0, var(--saturation), var(--lightness));
}

.link:focus {
  --lightness: 80%;
  --saturation: 20%;
}
```

In the example above we have separate control under different HSL color components -- lightness and saturation. Let's try to access them in JavaScript:

```js
const el = document.querySelector('.link');
const styleMap = el.computedStyleMap();

console.log(styleMap.get('--lightness'));
// CSSUnitValue {value: 50, unit: "percent"}

console.log(styleMap.get('--saturation'));
// CSSUnitValue {value: 50, unit: "percent"}
```

So we can get resolved property value and it returns nice object with unit property set as percent and numeric value. It is pretty cool to have such object in JS instead operating with strings. For example in animation implementation.

### length-percentage
As you might notice from its name, `length-percentage` is a kind of type alias for CSS length and percentage values. Here is the registration example:

```js
CSS.registerProperty({
  name: '--relative-size',
  syntax: '<length-percentage>',
  initialValue: 0
});
```

Let's try to reproduce the same type in the different way:

```js
CSS.registerProperty({
  name: '--relative-size',
  syntax: '<length> | <percentage>',
  initialValue: 0
});
```

Both of our custom properties declarations are equvivalent. Now we could use it in styles:

```css
.zero {
  --relative-size: 0;
  width: var(--relative-size);
}

.percent {
  --relative-size: 50%;
  width: var(--relative-size);
}

.length {
  --relative-size: 50vw;
  width: var(--relative-size);
}
```

Now, lets try to access the value from JavaScript:

```js
const zeroEl = document.querySelector('.zero');
const zeroStyleMap = zeroEl.computedStyleMap();

console.log(zeroStyleMap.get('--relative-size'));
// CSSUnitValue {value: 0, unit: "px"}

const percentEl = document.querySelector('.percent');
const percentStyleMap = percentEl.computedStyleMap();

console.log(percentStyleMap.get('--relative-size'));
// CSSUnitValue {value: 50, unit: "percent"}

const lengthEl = document.querySelector('.length');
const lengthStyleMap = lengthEl.computedStyleMap();

console.log(lengthStyleMap.get('--relative-size'));
// CSSUnitValue {value: 672, unit: "px"}
```

As you can see, we got all non-percent values in pixels. More interesting thing with length-percentage syntax is that it accepts expressions as a value:

```css
.calculated {
  --relative-size: calc(100vw - 20px);
  width: var(--relative-size);
}
```

Such expressions resolved differently according to the context they used in. In particular example above `calc` each operand will be converted to pixels and than evaluated. This happend cause we used our property as the value for `width`. But if will use it as a value for `hsl` saturation component which accepts only percentage we can use only percentages inside `calc` expression.

### integer
Integer type is represents numeric values without a fractional component. Let's declare property using tht type:

```js
CSS.registerProperty({
  name: '--sides',
  syntax: '<integer>',
  initialValue: 0
});
```

If we will try to assign float as an initial value, registration will fail with error:

```js
CSS.registerProperty({
  name: '--sides',
  syntax: '<integer>',
  initialValue: 0.1
});

// Uncaught DOMException: Failed to execute 'registerProperty' on 'CSS':
// The initial value provided does not parse for the given syntax.
```

There is no way to set that range of possible values for interger property for now, but hopefully it will come in the next specification versions. Here is how we can access value in JS:

```js
const el = document.querySelector('.zero');
const styleMap = zeroEl.computedStyleMap();

console.log(styleMap.get('--sides'));
// CSSUnitValue {value: 0, unit: "number"}
```

As you can see even when we give property type of integer, Typed OM returns us type number.

### number
As you can guess number type is similar to interger one, but allows to set float values as well:

```js
CSS.registerProperty({
  name: '--progress',
  syntax: '<number>',
  initialValue: 0.5
});
```

Nothing really special here, it works the same way as interger type.

### color
Color -- most used type in CSS, it makes the Web brighter.

```js
CSS.registerProperty({
  name: '--fill',
  syntax: '<color>',
  initialValue: 'transparent'
});
```

### image

```js
CSS.registerProperty({
  name: '--image',
  syntax: '<image>',
  initialValue: 'url()'
});
```

### url

```js
CSS.registerProperty({
  name: '--file',
  syntax: '<url> | none',
  initialValue: 'none'
});
```

### angle

```js
CSS.registerProperty({
  name: '--angle',
  syntax: '<angle>',
  initialValue: '0deg'
});
```

### time

```js
CSS.registerProperty({
  name: '--duration',
  syntax: '<time>',
  initialValue: '0s'
});
```

### resolution

```js
CSS.registerProperty({
  name: '--resolution',
  syntax: '<resolution>',
  initialValue: ''
});
```

### transform-list

```js
CSS.registerProperty({
  name: '--transform-state',
  syntax: '<transform-list>',
  initialValue: ''
});
```

### custom-ident
Custom indent is a special type that gives us ability to use own keywords as a value of a custom property. This custom value will be validated by CSS engine for us. Here is the registration example:

```js
CSS.registerProperty({
  name: '--keyword',
  syntax: 'left-side | right-side',
  initialValue: 'left-side'
});
```

You should remember that `custom-indent` is case sensitive. That means that `left-side` value is not equal to `LEFT-SIDE` value, and will be invalidated.

```js
CSS.registerProperty({
  name: '--keyword',
  syntax: 'left-side | right-side',
  initialValue: 'LEFT-SIDE'
});
```

CSS allows us to use property values in any lettercase we want. It is a good practive to write styles in lowercase, but browser won't judge you if you will decide to used uppercase one.

## How to use custom properties today?
First of all, we should remember that CSS ignores declarations that it can't parse. In addition to that it uses "last win" approach -- latest declaration overrides previous one. So we can simply put CSS rule with fallback value before `var()` function usage:

```css
.fallback {
  background-color: #fff;
  background-color: var(--bg-color, #fff);
}
```

Old browsers that has no implementation for custom properties will ignore second `background-color` rule and will use first one.

We can do fallback more explicitly, using supports at-rule:

```css
.variable-bg {
  background-color: #fff;
}

@supports(--foo: bar) {
  .variable-bg {
    background-color: var(--bg-color, #fff);
  }
}
```

But you should remember that not all browsers know about `@supports`. More sad thing, that we are just checking for simple CSS variables, there is no guarantee that browser will understood typed properties. To address our check to custom properties we need to use JS, at least for now. For example, we can add some class name to the root element:

```js
if (!('registerProperty' in CSS)) {
  document.documentElement.classList.add('no-custom-props');
}
```

So we can use this class name to target our fallback:

```css
.no-custom-props .variable-bg {
  background-color: #fff;
}

.variable-bg {
  background-color: var(--bg-color, #fff);
}
```

## Future
There is a [great proposal](https://github.com/w3c/css-houdini-drafts/issues/137) to "CSS Properties and Values API Level 2" specification that allows to register custom properties inside stylesheets. It is logical to declare custom property in the same place where it should be used. The other good reason to do it in CSS -- not revalidate variables again after registration of the property used. The proposed syntax looks like this:

```css
@property --highlight-color {
  syntax: '<color>';
  initial-value: red;
  inherits: true;
}
```

Note that it is not part of the spec yet. Even more it is just discussion of posibility to include something sinilar in the next specification level. The syntax could be completely different in the future and it is not implemented in any browser.

In the current draft it looks pretty straight-forward. We need to use property at-rule, followed by property name. Then inside `@property` block we use the same options: `syntax`, `inherits` and `initial-value` (in CSS-like notation). This should be equal to:

```js
CSS.registerProperty({
  name: '--highlight-color',
  syntax: '<color>',
  initialValue: 'red',
  inherits: true
});
```

I love the idea and decided to create PostCSS plugin that will use custom property declarations in CSS to generate JavaScript fallback, that registers all of them using `CSS.registerProperty`.

## Conclusion
Custom properties and value is so powerfull and a big game-changer in CSS. I can't even imagine all possible use-cases for them. It is an ocean of posibilities. For example you can use them to implement [lazy-loaded styles](https://jakearchibald.com/2016/css-loading-with-custom-props/)! Or implement customazible wb-site theme. Share your ideas in Twitter and over comments here.

### Resources

- [CSS Values and Units Module Level 4](https://drafts.csswg.org/css-values-4/)
- [CSS Properties and Values API Level 1](https://drafts.css-houdini.org/css-properties-values-api/​)

