---
title: "CSS Custom Properties in Depth: Part 2"
description: Deep dive into CSS Properties and Values API available types with real code examples.
ogimage: images/posts/css-custom-properties-in-depth-2/css-custom-properties-in-depth-2-og.jpg
tumb: /images/posts/css-custom-properties-in-depth-2/css-custom-properties-in-depth-2
created: 2018-05-31
updated: 2018-05-31
lastmod: 2018-05-31
draft: true
categories:
- CSS
- Houdini
---
### length
Length type stands for CSS sizing values, like pixel, em, rem, vw, vh, etc. We can declare custom property that expects that type with JavaScript:

```js
CSS.registerProperty({
  name: '--size',
  syntax: '<length>',
  initialValue: '0'
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
const stylemap = el.getComputedStyleMap();
const computedProp = styleMap.get(--size);
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

What is going on? We are using `getComputedStyleMap` method on DOM node to get resolved custom property. To assign new value we use `style.setProperty`, that creates property declaration inline. Then we use `style.getPropertyValue` that returns the string representation. As now we have property declared in style attribute we can use `attributeStyleMap` that returns unparsed value. Both `getComputedStyleMap` and `attributeStyleMap` are properties sets, but `getComputedStyleMap` is readonly. Resolved length property always return pixels value.

Manipulations with CSS units, like parsing, converting or creating values are part of CSS Typed OM specification. It is separate huge topic to sepak about. You can get overview from [this article](https://developers.google.com/web/updates/2018/03/cssom).

### percentage
Usully working with responsive web design (RWD) we trying to avoid pixel dependent units. Instead them we prefer relative ones, like percentages. Luckily we have ability to declare percentage syntax for custom properties.

```js
CSS.registerProperty({
  name: '--transparency',
  syntax: '<percentage>',
  initialValue: '0%'
});
```

### length-percentage

```js
CSS.registerProperty({
  name: '--relative-size',
  syntax: '<length-percentage>',
  initialValue: '0'
});
```

### number

```js
CSS.registerProperty({
  name: '--progress',
  syntax: '<number>',
  initialValue: '0'
});
```

### integer

```js
CSS.registerProperty({
  name: '--sides',
  syntax: '<integer>',
  initialValue: '0'
});
```

### color

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

### transform-list

```js
CSS.registerProperty({
  name: '--transform-state',
  syntax: '<transform-list>',
  initialValue: ''
});
```

### custom-ident

## How to use custom properties today?

## Conclusion
