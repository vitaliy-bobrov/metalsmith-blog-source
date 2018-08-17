---
title: "CSS Custom Properties in Depth: Part 2"
description: "Houdini \"Custom Properties and Values\" spec gives us the strictly typed CSS variables. It has a significant potential and as new technology is a pretty unknown field. Today, I'm going to have the in-depth overview of what types available in the first version of the spec, and show the usage on real examples."
ogimage: images/posts/css-custom-properties-in-depth-2/css-custom-properties-in-depth-2-og.jpg
tumb: /images/posts/css-custom-properties-in-depth-2/css-custom-properties-in-depth-2
created: 2018-07-16
updated: 2018-07-16
lastmod: 2018-08-14
categories:
- CSS
- Houdini
---
Houdini "Custom Properties and Values" spec gives us the strictly typed CSS variables. It has a significant potential and as new technology is a pretty unknown field. Today, I'm going to have the in-depth overview of what types available in the first version of the spec, and show the usage on real examples.

The topic split into two parts. Now you are reading the second one. You can check out the first part [here](https://vitaliy-bobrov.github.io/blog/css-custom-properties-in-depth/).{post__series}

## Available types
As I have written in the previous part, not all of the types are available for custom properties. In the initial specification, we have the only limited set of them. Let me introduce each of the possible types.

### **Note:**
*Work with `registerProperty` requires you to enable "Experimental Web Platform features"* -- `chrome://flags/#enable-experimental-web-platform-features` *to try it in Chrome.*

### length
Length type stands for CSS sizing values, like pixel, em, rem, vw, vh, etc. We can declare a custom property that expects that type with JavaScript:

```js
CSS.registerProperty({
  name: '--size',
  syntax: '<length>',
  inherits: false,
  initialValue: 0
});
```

If the assigned property value is invalid, the initial one is used.

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

Unfortunately, we can't use CSS variables in functions like `calc` as is. They work as just strings, and example below won't work as expected:

```css
.block {
  --size-variable: 20px; /* Not registered as <length>. */
  width: calc(50vw - var(--size-variable));
  height: var(--size-variable);
}
```

However, with the custom property it works like a charm:

```css
.block {
  --size: 20px;
  width: calc(50vw - var(--size)); /* 50vw - 20px. */
  height: var(--size);
}
```

Examples above look pretty similar to the usage of the variables in SASS. However, you should remember that in SASS variables are static and replaced at compile time.

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

What is going on? We are using `computedStyleMap` method on DOM node to get resolved custom property. To assign new value we use `style.setProperty`, that creates property declaration inline. Then we use `style.getPropertyValue` that returns the string representation. As now we have the property declared in style attribute we can use `attributeStyleMap` that returns unparsed value. Both `computedStyleMap` and `attributeStyleMap` are properties sets, but `computedStyleMap` is read-only. Resolved length property always return the pixels value.

Manipulations with CSS units, like parsing, converting or creating values are part of CSS Typed OM specification. It is a separate colossal topic to speak about. You can get an overview from [this article](https://developers.google.com/web/updates/2018/03/cssom).

### percentage
Usually working with responsive web design (RWD) we are trying to avoid pixel dependent units. Instead of them, we prefer relative ones, like percentages. Luckily we can declare percentage syntax for custom properties.

```js
CSS.registerProperty({
  name: '--lightness',
  syntax: '<percentage>',
  inherits: false,
  initialValue: '0%'
});
```

Please note that for unit values, like length or percentage you are not allowed to use zero value without units. It might be confusing because CSS allows you to do so. Even more it is kind of a good practice to use zero without units, because `0px === 0em === 0%`. That is why in the `--lightness` property defines the initial value specified as `0%` not just `0`.

One of the great examples where custom properties shine -- the control of the part of a CSS declaration. Let me show it:

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

So we can get resolved property value, and it returns a beautiful object with the unit property set as a percent and numeric value. It is pretty cool to have such an object in JS instead operating with strings. For example in animation implementation.

### length-percentage
As you might notice from its name, `length-percentage` is a kind of type alias for CSS length and percentage values. Here is the registration example:

```js
CSS.registerProperty({
  name: '--relative-size',
  syntax: '<length-percentage>',
  inherits: false,
  initialValue: 0
});
```

Let's try to reproduce the same type differently:

```js
CSS.registerProperty({
  name: '--relative-size',
  syntax: '<length> | <percentage>',
  inherits: false,
  initialValue: 0
});
```

Both of our custom properties declarations are equivalent. Now we could use it in styles:

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

As you can see, we got all non-percent values in pixels. The more interesting thing with length-percentage syntax is that it accepts expressions as a value:

```css
.calculated {
  --relative-size: calc(100vw - 20px);
  width: var(--relative-size);
}
```

Such expressions resolved differently according to the context they used it. In particular example above `calc`, each operand will be converted to pixels and then evaluated. Such convert happened cause we used our property as the value for `width`. But it will use it as a value for `hsl` saturation component which accepts the only percentage we can use only percentages inside `calc` expression.

### integer
Integer type is represents numeric values without a fractional component. Let's declare property using that type:

```js
CSS.registerProperty({
  name: '--sides',
  syntax: '<integer>',
  inherits: false,
  initialValue: 0
});
```

If we try to assign float as an initial value, registration will fail with the error:

```js
CSS.registerProperty({
  name: '--sides',
  syntax: '<integer>',
  inherits: false,
  initialValue: 0.1
});

// Uncaught DOMException: Failed to execute 'registerProperty' on 'CSS':
// The initial value provided does not parse for the given syntax.
```

There is no way to set the range of possible values for interger property for now, but hopefully it will come in the next specification versions. Here is how we can access value in JS:

```js
const el = document.querySelector('.zero');
const styleMap = zeroEl.computedStyleMap();

console.log(styleMap.get('--sides'));
// CSSUnitValue {value: 0, unit: "number"}
```

As you can see even when we give property type of integer, Typed OM returns us type number.

### number
As you can guess number type is similar to integer one but allows to set float values as well:

```js
CSS.registerProperty({
  name: '--progress',
  syntax: '<number>',
  inherits: false,
  initialValue: 0.5
});
```

Nothing extraordinary here, it works the same way as integer type.

### color
Color -- most used type in CSS, it makes the Web brighter.

```js
CSS.registerProperty({
  name: '--fill',
  syntax: '<color>',
  inherits: false,
  initialValue: 'transparent'
});
```

You can use any color values that available in CSS: HEX, RGBA, RGBA, HSL, etc. With typed custom property the browser will recognise that variable is not just a string but color value. So it will know how to interpolate value for transitions and animations.

### image
Image syntax is the most intriguing one, as it opens the door to do crazy stuff with images. The canvas implementation for CSS Paint API doesn't support methods to read pixels from the element for security reasons. I don't think anybody wants 3rd party stylesheet could read his sensitive data. So the only way to draw images inside custom paint is to use image passed as input property or argument. Below is the registration of the image custom property:

```js
CSS.registerProperty({
  name: '--image',
  syntax: '<image>',
  inherits: false,
  initialValue: 'url()'
});
```

Let's try to set and use our `--image` property with CSS Paint API:

```css
.placeholder {
  --image: url('/some/image/url.png');
  background-image: paint(image-placeholder);
}
```

```js
CSS.paintWorklet.addModule('image-placeholder.js');
```

Now I'm going to implement `image-placeholder` painter:

```js
// image-placeholder.js

class ImagePlaceholder {
  static get inputProperties() {
    return ['--image'];
  }

   paint(ctx, {width, height}, props) {
    const img = props.get('--image');
    const radius = Math.min(width, height) / 2;

    switch (img.state) {
      case 'ready':
        // The image is loaded! Draw the image.
        ctx.drawImage(img, 0, 0, geom.width, geom.height);
        break;

      case 'pending':
        // The image is loading, draw placeholder.
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, width, height);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(0, height);
        ctx.stroke();
        break;

      case 'invalid':
      default:
        // The image is invalid (e.g. it didn’t load), draw circle.
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
  }
}

registerPaint('image-placeholder', ImagePlaceholder);
```

The image property syntax still not implemented, but according to the spec we `paint` is called on image loading stages. So we have access to the `state` of an image. The state could have few values: ready, pending and invalid. The names of states are speaking itself.

In our example, we are relying on an image state. If the image still loading (its state pending), we draw placeholder. If it is ready, we draw the image. Moreover, red circle on errors -- invalid state.

Hopefully, implementation will arrive in the browsers this year. Image custom properties will open immense horizons.

### url
URL type is similar to the image, with one difference it is not restricted to media MIME types. This type still in development as well, below is an example registration:

```js
CSS.registerProperty({
  name: '--file',
  syntax: '<url> | none',
  inherits: false,
  initialValue: 'none'
});
```

Theoretically, it will allow requesting any files to use in other Houdini APIs. My first thought was to use it for JSON files fetching. Imagine we have bar chart custom painter and we can request dataset in JSON format for it. Sounds awesome? Can't wait for the working implementation.

### angle
Angles are rarely used in CSS, usually in special properties, like transforms. However, in combination with CSS Paint API, it gives strictly typed and values to use with 2D canvas context. In CSS we have few valid angle units: degrees, radians, gradians and turns (`deg`, `rad`, `grad`, `turn`). All of them could use as a value for angle syntax. Below is the example:

```js
CSS.registerProperty({
  name: '--angle',
  syntax: '<angle>',
  inherits: false,
  initialValue: '0deg'
});
```

### time
Time usually used with transitions and animations. It accepts seconds and milliseconds (`s` and `ms` respectively). Use case: we can use time custom property for animation duration control. Here is the example how to register property:

```js
CSS.registerProperty({
  name: '--duration',
  syntax: '<time>',
  inherits: false,
  initialValue: '0s'
});
```

### resolution
CSS resolution has few possible unit values: dots per inch, dots per centimeter and dots per pixel unit. In CSS they look like: `dpi`, `dpcm` and `dppx` respectively. The possible use case is adjusting canvas resolution to a user device screen. You can register such property this way:

```js
CSS.registerProperty({
  name: '--resolution',
  syntax: '<resolution>',
  inherits: false,
  initialValue: '1dppx'
});
```

### transform-function
Transform function is a single tranformation CSS declaration like `translate`, `rotate` or `scale`. It is building block for transform declaration. We can combine few custom propertis to get resulting transform. Below is an example:

```js
CSS.registerProperty({
  name: '--transform-rotation',
  syntax: '<transform-function>',
  inherits: false,
  initialValue: 'rotate(0deg)'
});

CSS.registerProperty({
  name: '--transform-scale',
  syntax: '<transform-function>',
  inherits: false,
  initialValue: 'scale(1)'
});
```

And composition of custom properties in CSS:

```css
.transformed-element {
  transform: var(--transform-rotation) var(--transform-scale);
  animation: trans 1s;
}

@keyframes trans {
  0% {
    --transform-rotation: rotate(0deg);
    --transform-scale: scale(1);
  }

  40% {
    --transform-rotation: rotate(45deg);
  }

  60% {
    --transform-scale: scale(1.2);
  }

  80% {
    --transform-rotation: rotate(90deg);
    --transform-scale: scale(1.5);
  }

  100% {
    --transform-rotation: rotate(0deg);
    --transform-scale: scale(1);
  }
}
```

In the example we are manipulating different transform functions separately.

### transform-list
Transform list is just stands for the list of `transform-function`s separated by space. Below the example:

```js
CSS.registerProperty({
  name: '--transformations',
  syntax: '<transform-list>',
  inherits: false,
  initialValue: 'rotate(90deg) translateX(5rem)'
});
```

We can achieve the same resulting property registration using another syntax:

```js
CSS.registerProperty({
  name: '--transformations',
  syntax: '<transform-function>+',
  inherits: false,
  initialValue: 'rotate(90deg) translateX(5rem)'
});
```

### custom-ident
Custom indent is a special type that gives us the ability to use own keywords as a value of a custom property. This custom value will be validated by the CSS engine for us. Here is the registration example:

```js
CSS.registerProperty({
  name: '--keyword',
  syntax: 'left-side | right-side',
  inherits: false,
  initialValue: 'left-side'
});
```

You should remember that `custom-indent` is case sensitive. That means that `left-side` value is not equal to `LEFT-SIDE` value, and will be invalidated.

```js
CSS.registerProperty({
  name: '--keyword',
  syntax: 'left-side | right-side',
  inherits: false,
  initialValue: 'LEFT-SIDE'
});
```

CSS allows us to use property values in any case we want. It is a good practice to write styles in lowercase, but browser won't judge you if you decide to used uppercase one.

## How to use custom properties today?
First of all, we should remember that CSS ignores declarations that it can't parse. In addition to that, it uses "last win" approach -- latest declaration overrides previous one. So we can simply put CSS rule with a fallback value before `var()` function usage:

```css
.fallback {
  background-color: #fff;
  background-color: var(--bg-color, #fff);
}
```

Old browsers that have no implementation for custom properties ignore second `background-color` rule and use the first one.

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

But you should remember that not all browsers know about `@supports`. The more sad thing that we are just checking for simple CSS variables, there is no guarantee that the browser will understand typed properties. To address our check to custom properties, we need to use JS, at least for now. For example, we can add some class name to the root element:

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
There is a [great proposal](https://github.com/w3c/css-houdini-drafts/issues/137) to "CSS Properties and Values API Level 2" specification that allows registering custom properties inside stylesheets. It is logical to declare a custom property in the same place where it should be used. The other good reason to do it in CSS -- not revalidate variables again after registration of the property used. The proposed syntax looks like this:

```css
@property --highlight-color {
  syntax: '<color>';
  initial-value: red;
  inherits: true;
}
```

Note that it is not part of the spec yet. Even more, it is just discussion of possibility to include something similar in the next specification level. The syntax could be completely different in the future, and it is not implemented in any browser.

In the current draft, it looks pretty straight-forward. We need to use property at-rule, followed by property name. Then inside `@property` block we use the same options: `syntax`, `inherits` and `initial-value` (in CSS-like notation). This should be equal to:

```js
CSS.registerProperty({
  name: '--highlight-color',
  syntax: '<color>',
  initialValue: 'red',
  inherits: true
});
```

I loved the idea and decided to create a PostCSS plugin that will use custom property declarations in CSS to generate JavaScript fallback, that registers all of them using `CSS.registerProperty`.

[Star on GitHub](https://github.com/vitaliy-bobrov/postcss-register-custom-props)
{star-me}

## Conclusion
Custom properties and value are powerful and a big game-changer in CSS. I can't even imagine all the possible use-cases for them. It is an ocean of possibilities. For example, you can use them to implement [lazy-loaded styles](https://jakearchibald.com/2016/css-loading-with-custom-props/)! Alternatively, implement a customizable website theme. Share your ideas on Twitter and over comments here.

### Resources

- [CSS Values and Units Module Level 4](https://drafts.csswg.org/css-values-4/)
- [CSS Properties and Values API Level 1](https://drafts.css-houdini.org/css-properties-values-api/​)

