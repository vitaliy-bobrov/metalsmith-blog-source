---
title: "CSS Paint in Action: Bar Chart"
description: Want to know how to create bar chart with CSS Paint API?.
ogimage: images/posts/css-paint-in-action-bar-chart/css-paint-in-action-bar-chart-og.jpg
tumb: /images/posts/css-paint-in-action-bar-chart/css-paint-in-action-bar-chart
created: 2018-04-13
categories:
- CSS
- Houdini
---
In my [previous article](/blog/exploring-the-css-paint-api/) we discovered CSS Paint API basics. Today, with this knowledge arsenal we are going to create data visualizations that could be used in production projects -- bar chart. More than 65% of the humans are visual learners. Visualization makes it easier to understand, compare, and analyze data. Using CSS Paint API, we can encapsulate all logic related to drawing charts on canvas and expose the high-level declarative interface.

The most uncomplicated graph we can create is a bar chart 📊. It is the set of rectangles, possibly with a different background color, and the size of each box represents its value compared to the others. Usually, the maximum dataset value is taken as the 100% on the target axis. So in our example, we will use the range from zero to the maximum amount of the given dataset for values axis, as in 90% cases this is what we need to implement. On the secondary axis, we will linearly distribute our bars and separate them with the gap in pixels specified by the passed argument.

To create custom painter we need to follow three easy steps: declare a custom paint class, register paint, and load worklet. So let's start with the painter class definition:

```js
class BarChartPainter {
  static get inputProperties() {
    return [
      '--bar-map',
      '--bar-gap'
    ];
  }

  paint(ctx, geom, props) {
    // Here will be our paint implementation.
  }
}
```

So, for now, our `paint` method does nothing 🤥, the only thing we declared is the static `inputProperties` getter. This getter will return the list of CSS variable our painter relies on, that means that after each change of the value of this variables browser will call our `paint` method.

## Dataset
Our first variable stands for dataset we will use to draw the chart. My first thought was to use Custom Properties API from Houdini for them and use something like `<color-stop>` type. `<color-stop>` is the pair of percentage or length value and CSS color. Value and color are separated by spaces. The list of `<color-stop>` value used for `linear-gradient` function, to declare that we want to use a list of Typed OM values we need to add `+` at the end of type declaration -- `<color-stop>+`. Unfortunately for now `CSS.registerProperty` doesn't support lists and `<color-stop>` type.

```js
CSS.registerProperty({
  name: '--data-points',
  syntax: '<color-stop>',
  inherits: false
});

CSS.registerProperty({
  name: '--data-colors',
  syntax: '<color>+',
  inherits: false
});

Uncaught DOMException: Failed to execute 'registerProperty' on 'CSS':
The syntax provided is not a valid custom property syntax.
```

Such argument will cause `DOMException` errors. After my initial idea failed, I decided to follow with CSS variable with special syntax. CSS variables are just strings that will be interpolated in place they are used.

```css
.hello-var {
  --my-varialbe: 'hello world';
}

.hello-var:after {
  content: var(--my-varialbe);
}
```

Text "hello world" will be used as the value for `after` pseudo-element `content` property. That is completely equivalent to:

```css
.hello-var:after {
  content: 'hello world';
}
```

So I decided to use `number` and `color` pairs delimited by a comma. Each number will represent the value for bar and color will be used for the background. This implementation has a big issue as we can't use commas in color or value. I think it is ok for now to stay with that, as I wouldn't to complicate tutorial with `RexExp`. Here how our data set should look like:

```css
.bars {
  --bar-map: 50 #666, 70 salmon, 35 #9ee7a1, 15 #fff, 25 orange;
}
```

## Data parsing
After input format decision made we can implement helper method to parse it in our painter class:

```js
class BarChartPainter {
  _parseData(input) {
    return input.toString()
    .split(',')
    .map(entry => {
      const [value, color] = entry.trim().split(' ');

      return {
        value: parseFloat(value, 10) || 0,
        color: color || 'black'
      };
    });
  }
}
```

Nothing special here, we pass our CSS variable input and transform to the list of objects. Additionally, we added fallbacks for value and color. Next, we will add the helper method to get the maximum value from given dataset:

```js
class BarChartPainter {
  _getMax(dataset) {
    return dataset.reduce((maxVal, entry) => {
      return maxVal < entry.value ? entry.value : maxVal;
    }, 0);
  }
}
```

## Drawing bars
For the beginning let's make vertical bars, other orientation support will be in our "To Do" list. We are going to implement main -- `paint` method:

```js
class BarChartPainter {
  paint(ctx, {width, height}, props) {
    const gap = parseInt(
      (props.get('--bar-gap') || 10).toString(),
      10
    );
    const data = this._parseData(props.get('--bar-map'));
    const max = this._getMax(data);
    const multiplier = height / max;
    const barW = (width - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barW + gap);
      const barHeight = data[i].value * multiplier;
      const y = domain - barHeight;

      ctx.fillStyle = data[i].color;

      ctx.fillRect(x, y, barW, barHeight);
    }
  }
}
```

Let's look at this method line-by-line 🧐. First of all get trying to get `--bar-gap` variable and parse it as an integer. If no gap defined `props.get('--bar-gap')` will return `null` so we were providing fallback value before calling `toString`. Then we are parsing our dataset stored in `--bar-map` variable and getting the maximum value using helpers we defined before. Then we were calculating how much height should be one value point by dividing canvas height by maximum value. After that, we were calculating the width of each bar. And finally, we are iterating our dataset and draw rectangles for each of the value.

Now we are ready to register our paint:

```js
registerPaint('bar-chart', BarChartPainter);
```

Here is the full content of our worklet JavaScript file:

```js
class BarChartPainter {
  static get inputProperties() {
    return [
      '--bar-map',
      '--bar-gap'
    ];
  }

  _parseData(input) {
    return input.toString()
    .split(',')
    .map(entry => {
      const [value, color] = entry.trim().split(' ');

      return {
        value: parseFloat(value, 10) || 0,
        color: color || 'black'
      };
    });
  }

  _getMax(dataset) {
    return dataset.reduce((maxVal, entry) => {
      return maxVal < entry.value ? entry.value : maxVal;
    }, 0);
  }

  paint(ctx, {width, height}, props) {
    const gap = parseInt(
      (props.get('--bar-gap') || 10).toString(),
      10
    );
    const data = this._parseData(props.get('--bar-map'));
    const max = this._getMax(data);
    const multiplier = height / max;
    const barW = (width - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barW + gap);
      const barHeight = data[i].value * multiplier;
      const y = domain - barHeight;

      ctx.fillStyle = data[i].color;

      ctx.fillRect(x, y, barW, barHeight);
    }
  }
}

registerPaint('bar-chart', BarChartPainter);
```

## Loading the worklet
So to have the ability to use our custom painter in the stylesheet, we need to load our worklet:

```js
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('paint.js');
}
```

I called my file as `paint.js` and the loading it using `CSS.paintWorklet.addModule` method. Not far time ago [Surma](https://twitter.com/dassurma), main Houdini project supporter, published interesting [cheat](https://twitter.com/DasSurma/status/983305990731894785) how to avoid additional HTTP request to load worklets. We can't write worklet code as inline JavaScript because it shouldn't have access to the global scope. All worklets executed in separate browser context with insufficient functionality for security reasons. Inside this context we can use only small subset of 2D canvas, few global JS functions and helpers, like `parseInt` or `Math`, but no `setInterval`, `setTimeout` or `requestAnimationFrame`. The idea behind Surma's worklet embedding method is to write code inline inside `script` tag but with different language type, to avoid its execution. Then we can convert it to `Blob` objects and create object URL from it. Here is the code example:

```html
<script language="javascript+paint">
  class BarChartPainter {
    paint(ctx, geom, props) {}
  }

  registerPaint('bar-chart', BarChartPainter);
</script>

<script>
  function blobWorklet() {
    const src = document
      .querySelector('script[language$="paint"]')
      .innerHTML;
    const blob = new Blob([src], {type: 'text/javascript'});

    return URL.createObjectURL(blob);
  }

  if ('paintWorklet' in CSS) {
    CSS.paintWorklet.addModule(blobWorklet());
  }
</script>
```

Using this trick, we avoid sending additional HTTP request to load CSS Paint worklet.

## Using worklet
After our painter registered and loaded we can call it in CSS:

```css
.bars {
  height: 700px;
  max-height: 50vh;
  --bar-map: 50 #666, 70 salmon, 35 #9ee7a1, 15 #fff, 25 orange;
  --bar-gap: 20;
  background: #111 paint(bar-chart);
}

@supports not (background: paint(bar-chart)) {
  .bars:after {
    content: 'Your browser does not support CSS Paint API :(';
  }
}
```

We declared `--bar-map` and `--bar-gap` variables and call custom paint using `paint(bar-chart)`. We set solid background color as well. Also, I have added feature detection with `@supports` rule. Using this if a browser hasn't support of CSS Paint API, it will show an appropriate message to the user.

## Improvements
We have already created bar chart MVP and now is the time to think about its improvements. Actually, there are a lot of points to improve, and I am not going to cover all of them. If you want to implement more feel free to fork my repository and do it, just don't forget to share your ideas in the comments below and social networks (in Twitter please ping [me](https://twitter.com/bobrov1989)).

So the first point I want to do is to add the possibility to define offsets for our chart. And I'm going to use `padding` property for that. Here is the updated painter class:

```js
class BarChartPainter {
  static get inputProperties() {
    return [
      '--bar-map',
      '--bar-gap',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ];
  }

  paint(ctx, geom, props) {
    const position = props.get('--bar-placement').toString().trim();
    const gap = parseInt((props.get('--bar-gap') || 10).toString(), 10);
    const padding = {
      top: props.get('padding-top').value,
      right: props.get('padding-right').value,
      bottom: props.get('padding-bottom').value,
      left: props.get('padding-left').value
    };
    const width = geom.width - padding.left - padding.right;
    const height = geom.height - padding.top - padding.bottom;
    const data = this._parseData(props.get('--bar-map'));
    const max = this._getMax(data);
    const multiplier = height / max;
    const barW = (width - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barW + gap) + padding.left;
      const barHeight = data[i].value * multiplier;
      const y = domain - barHeight + padding.top;

      ctx.fillStyle = data[i].color;

      ctx.fillRect(x, y, barW, barHeight);
    }
  }
}
```

Now we are using padding values to calculate bar width and height. Next, I want to add the possibility to change chart orientation. I will introduce `--bar-orientation` variable with possible values: top, bottom, left and right. Here is the final code:

```js
class BarChartPainter {
  static get inputProperties() {
    return [
      '--bar-map',
      '--bar-placement',
      '--bar-gap',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ];
  }

  _parseData(input) {
    return input.toString()
    .split(',')
    .map(entry => {
      const [value, color] = entry.trim().split(' ');

      return {
        value: parseFloat(value, 10) || 0,
        color: color || 'black'
      };
    });
  }

  _getMax(dataset) {
    return dataset.reduce((maxVal, entry) => {
      return maxVal < entry.value ? entry.value : maxVal;
    }, 0);
  }

  paint(ctx, geom, props) {
    const position = props.get('--bar-placement').toString().trim();
    const gap = parseInt((props.get('--bar-gap') || 10).toString(), 10);
    const padding = {
      top: props.get('padding-top').value,
      right: props.get('padding-right').value,
      bottom: props.get('padding-bottom').value,
      left: props.get('padding-left').value
    };
    const vertical = position === 'top' || position === 'bottom';
    const width = geom.width - padding.left - padding.right;
    const height = geom.height - padding.top - padding.bottom;
    const data = this._parseData(props.get('--bar-map'));
    const max = this._getMax(data);

    const domain = vertical ? height : width;
    const baseWidth = vertical ? width : height;
    const multiplier = domain / max;
    const barW = (baseWidth - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barW + gap) + padding.left;
      const barH = data[i].value * multiplier;
      const y = {
        top: padding.top,
        right: domain - barH + padding.left,
        bottom: domain - barH + padding.top,
        left: padding.left
      }[position];

      ctx.fillStyle = data[i].color;

      if (vertical) {
        ctx.fillRect(x, y, barW, barH);
      } else {
        ctx.fillRect(y, x, barH, barW);
      }
    }
  }
}
```

And updated styles:

```css
.bars {
  height: 700px;
  max-height: 50vh;
  padding: 30px 10px 0;
  --bar-placement: bottom;
  --bar-gap: 40;
  --bar-map: 50 #666, 70 salmon, 35 #9ee7a1, 15 #fff, 25 orange;
  background: #111 paint(bar-chart);
}
```

[](youtube:dn1bwJPQY5I)

As usual you can check [code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/bar) and [demo](https://vitaliy-bobrov.github.io/css-paint-demos/bar/).

## Change input format
After thinking for some time, I decided to change dataset input using "JS in CSS". Yes, you read it correctly, I want to use JavaScript inside CSS. As I said before Our worklet code executed in secure separate context and this case is completely fine to use some JS as CSS variable value. Then I'm going to parse this value in custom painter using `JSON.parse`. Let look at stylesheet first:

```css
.bars {
  height: 700px;
  max-height: 50vh;
  padding: 10px;
  background: #111 paint(bar-chart);
  --bar-placement: bottom;
  --bar-gap: 40;
  --bar-map: [
    {
      "value": 55,
      "color": "rgba(250, 128, 114, .8)"
    },
    {
      "value": 10,
      "color": "rgba(102, 51, 153, .9)"
    },
    {
      "value": 120,
      "color": "hsl(39, 100%, 50%)"
    },
    {
      "value": 36.8,
      "color": "#666"
    },
    {
      "value": 97.5,
      "color": "#9ee7a1"
    }
  ];
}
```

So I defined JSON array with data objects in my CSS! Such rule looks strange but more verbose then special string before. So now I can remove `_parseData` method from painter class and use `JSON.parse` instead:

```js
class BarChartPainter {
  static get inputProperties() {
    return [
      '--bar-map',
      '--bar-placement',
      '--bar-gap',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ];
  }

  _getMax(dataset) {
    return dataset.reduce((maxVal, entry) => {
      return maxVal < entry.value ? entry.value : maxVal;
    }, 0);
  }

  paint(ctx, geom, props) {
    const position = props.get('--bar-placement').toString().trim();
    const gap = parseInt((props.get('--bar-gap') || 10).toString(), 10);
    const padding = {
      top: props.get('padding-top').value,
      right: props.get('padding-right').value,
      bottom: props.get('padding-bottom').value,
      left: props.get('padding-left').value
    };
    const vertical = position === 'top' || position === 'bottom';
    const width = geom.width - padding.left - padding.right;
    const height = geom.height - padding.top - padding.bottom;
    // Much simplier data parsing!
    const data = JSON.parse(props.get('--bar-map').toString());

    const max = this._getMax(data);

    const domain = vertical ? height : width;
    const baseWidth = vertical ? width : height;
    const multiplier = domain / max;
    const barW = (baseWidth - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barW + gap) + padding.left;
      const barH = data[i].value * multiplier;
      const y = {
        top: padding.top,
        right: domain - barH + padding.left,
        bottom: domain - barH + padding.top,
        left: padding.left
      }[position];

      ctx.fillStyle = data[i].color;

      if (vertical) {
        ctx.fillRect(x, y, barW, barH);
      } else {
        ctx.fillRect(y, x, barH, barW);
      }
    }
  }
}
```

How is it useful? Now we can get CSS variables in JavaScript, change the data and animate it! Then we need to call `JSON.stringify` and set the new value. Without JavaScript we can swap the data, on hover for example:

```css
.bars:hover {
  --bar-map: [
    {
      "value": 5,
      "color": "rgba(250, 128, 114, .8)"
    },
    {
      "value": 100,
      "color": "rgba(102, 51, 153, .9)"
    },
    {
      "value": 21,
      "color": "hsl(39, 100%, 50%)"
    },
    {
      "value": 120,
      "color": "#666"
    },
    {
      "value": 37,
      "color": "#9ee7a1"
    }
  ];
}
```

[](youtube:toWY6fmpmQg)

[Code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/bar-js-in-css) and [demo](https://vitaliy-bobrov.github.io/css-paint-demos/bar-js-in-css/).

Now let's try to animate dataset in JavaScript:

```js
const canvas = document.querySelector('.bars');
const style = getComputedStyle(canvas);
const initialValues = JSON.parse(style.getPropertyValue('--bar-map'))
  .map(v => v.value);
const TIME = 1000;

function rand(max, min) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animate(values, time) {
  const start = performance.now();
  const style = getComputedStyle(canvas);
  const init = JSON.parse(style.getPropertyValue('--bar-map'));
  const from = init.map(v => v.value);
  const increments = from.map((v, i) => {
    return -(v - values[i]) / time;
  });

  return function raf(now) {
    const count = Math.floor(now - start);
    const style = getComputedStyle(canvas);
    const dataset = JSON.parse(style.getPropertyValue('--bar-map'));
    const value = dataset.map((s, i) => {
      return {
        ...s,
        value: from[i] + (increments[i] * count)
      };
    });

    canvas.style.setProperty('--bar-map', JSON.stringify(value));

    if(count > time) {
      const final = dataset.map((s, i) => {
        return {
          ...s,
          value: values[i]
        };
      });
      canvas.style.setProperty('--bar-map', JSON.stringify(final));

      return;
    }

    requestAnimationFrame(raf);
  }
}

canvas.addEventListener('mouseenter', event => {
  const values = initialValues.map(() => rand(0, 120));

  requestAnimationFrame(animate(values, TIME));
});

canvas.addEventListener('mouseleave', event => {
  requestAnimationFrame(animate(initialValues, TIME));
});
```

So using `requestAnimationFrame` on mouse enter I animated dataset from the initial value to random data set and in opposite direction on mouse leave. Also, I've added `--bar-max` variable to set the range for the main axis from zero to this value. Here is the updated painter class:

```js
class BarChartPainter {
  static get inputProperties() {
    return [
      '--bar-map',
      '--bar-placement',
      '--bar-gap',
      '--bar-max',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ];
  }

  paint(ctx, geom, props) {
    const position = props.get('--bar-placement').toString().trim();
    const gap = parseInt((props.get('--bar-gap') || 10).toString(), 10);
    const max = parseInt(props.get('--bar-max').toString(), 10);
    const padding = {
      top: props.get('padding-top').value,
      right: props.get('padding-right').value,
      bottom: props.get('padding-bottom').value,
      left: props.get('padding-left').value
    };
    const vertical = position === 'top' || position === 'bottom';
    const width = geom.width - padding.left - padding.right;
    const height = geom.height - padding.top - padding.bottom;
    const data = JSON.parse(props.get('--bar-map').toString());

    const domain = vertical ? height : width;
    const baseWidth = vertical ? width : height;
    const multiplier = domain / max;
    const barW = (baseWidth - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barW + gap) + padding.left;
      const barH = data[i].value * multiplier;
      const y = {
        top: padding.top,
        right: domain - barH + padding.left,
        bottom: domain - barH + padding.top,
        left: padding.left
      }[position];

      ctx.fillStyle = data[i].color;

      if (vertical) {
        ctx.fillRect(x, y, barW, barH);
      } else {
        ctx.fillRect(y, x, barH, barW);
      }
    }
  }
}
```

[](youtube:kUgWZsoyjqU)

[Code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/bar-animate) and [demo](https://vitaliy-bobrov.github.io/css-paint-demos/bar-animate/).

## Recap
Today we implemented basic bar chart, then extend its functionality, tried to use JavaScript in CSS and animate data with `requestAnimationFrame`. I hope this was awesome, and as I still experimenting with Houdini APIs more exciting posts will come. Let's keep in touch!
