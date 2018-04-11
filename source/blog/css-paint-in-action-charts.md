---
title: "CSS Paint in Action: Charts"
description: Want to know how to create charts with CSS Paint API?.
ogimage: images/posts/css-paint-in-action-charts/css-paint-in-action-charts-og.jpg
tumb: /images/posts/css-paint-in-action-charts/css-paint-in-action-charts
created: 2018-03-19
draft: true
categories:
- CSS
- Houdini
---
In my [previous article](/blog/exploring-the-css-paint-api/) we discovered CSS Paint API basics and main principles. Today, with this knowledge arsenal we are going to create data visualisations that could be used in production projects -- charts.

The best way to provide people with any data meaning is charts and graphs. More than 65% of the humans are visual learners. Visualization makes it easier to understand, compare, and analyze data. Using CSS Paint API we can encapsulte all logic related to drawing charts on canvas and expose declarative high-level interface.

## Bar Chart
The simpliest graph we can create is a bar chart. It is the set of rectangles, possibly with different background color, and the size of each rectangle represents its value compared to the others. Usually the maximum dataset value taken as the 100% on the taget axis. So in our example we will use the range from zero to the maximum value of them given dataset for values axis, as in 90% cases this is what we need to implement. On the secondary axis we will lineary distribute our bars and separate them with the gap in pixels specified by passed argument.

To create custom painter we need to follow three easy steps: declare a custom paint class, register paint and load worklet. So lets start with the painter class definition:

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

So for now our `paint` method do nothing, the only thing we declared is the static `inputProperties` getter. This getter will return the list of CSS variable our painter relies on, that means that after each change of the value of this variables browser will call our `paint` method.

### Dataset
Our first variable stands for dataset we will use to draw the chart. My first thought was to use Custom Properties API from Houdini for them and use something like `<color-stop>` type. `<color-stop>` is the pair of percentage or lenght value and CSS color. value and color are separated with the space. The list of `<color-stop>` value used for `linear-gradient` function, to declare that we want to use a list of Typed OM values we need to add `+` at the end of type declaration -- `<color-stop>+`. Unfortunately for now `CSS.registerProperty` doesn't support lists and `<color-stop>` type.

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

Uncaught DOMException: Failed to execute 'registerProperty' on 'CSS': The syntax provided is not a valid custom property syntax.
```

Such argument will cause `DOMException` errors. After my initial idea failed I decided to follow with CSS variable with special syntax. CSS variables are just strings that will be interpolated in place they are used.

```css
.hello-var {
  --my-varialbe: 'hello world';
}

.hello-var:after {
  content: var(--my-varialbe);
}
```

Text "hello world" will be use as the value for `after` pseudo-element `content` property. This is completely equvivalent to:

```css
.hello-var:after {
  content: 'hello world';
}
```

So I decided to use `number` and `color` pairs delimited by comma. Each number will represent the value for bar and color will be used for background. This implementation has a big issue as we can't use commas in color or value. I think it is ok for now to stay with that, as I won't to complicate tutorial with `RexExp`. Here how our data set should look like:

```css
.bars {
  --bar-map: 50 #666, 70 salmon, 35 #9ee7a1, 15 rebeccapurple, 25 orange;
}
```

### Data parsing
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

Nothing special here, we pass our CSS variable input and transform to the list of objects. Additionally we added fallbacks for value and color. Next we will add helper method to get the maximum value from given dataset:

```js
class BarChartPainter {
  _getMax(dataset) {
    return dataset.reduce((maxVal, entry) => {
      return maxVal < entry.value ? entry.value : maxVal;
    }, 0);
  }
}
```

### Drawing bars
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
    const barWidth = (width - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barWidth + gap);
      const barHeight = data[i].value * multiplier;
      const y = domain - barHeight;

      ctx.fillStyle = data[i].color;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
}
```

Let's look on this method line-by-line. First of all get trying to get `--bar-gap` variable and parse it as interger. If no gap defined `props.get('--bar-gap')` will return `null` so we are providing fallback value before calling `toString`. Then we parsing our dataset stored in `--bar-map` variable and getting maximum value using helpers we defined before. Then we calculating how much height should be one value point by deviding canvas height by maximum value. After that we calculating width of each bar. And finally we are iterating our dataset and draw rectangles for each of the value.

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
    const barWidth = (width - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barWidth + gap);
      const barHeight = data[i].value * multiplier;
      const y = domain - barHeight;

      ctx.fillStyle = data[i].color;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
}

registerPaint('bar-chart', BarChartPainter);
```

### Loading the worklet
So to have ability to use our custom painter in the stylesheet we need to load our worklet:

```js
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('paint.js');
}
```

I called my file as `paint.js` and the loading it useing `CSS.paintWorklet.addModule` method. Not far time ago [Surma](https://twitter.com/dassurma), main Houdini project supporter, published interesting [cheat](https://twitter.com/DasSurma/status/983305990731894785) how to avoid additional HTTP request to load worklets. We can't write worklet code as inline JavaScript because it shouldn't has access to the global scope. All worklets executed in separate browser context with very limited functionality for security reasons. Inside this context we can use only small subset of 2D canvas, few global JS functions and helpers, like `parseInt` or `Math`, but no `setInterval`, `setTimeout` or `requestAnimationFrame`. The idea behind Surma's worklet embeding method is to write code inline inside `script` tag but with different language type, to avoid its execution. Then we can convert it to `Blob` objects and create object URL from it. Here is the code example:

```html
<script language="javascript+paint">
  class BarChartPainter {
    paint(ctx, geom, props) {}
  }

  registerPaint('bar-chart', BarChartPainter);
</script>

<script>
  function blobWorklet() {
    const src = document.querySelector('script[language$="paint"]').innerHTML;
    const blob = new Blob([src], {type: 'text/javascript'});

    return URL.createObjectURL(blob);
  }

  if ('paintWorklet' in CSS) {
    CSS.paintWorklet.addModule(blobWorklet());
  }
</script>
```

Using this we avoid to send additional HTTP request to load CSS Paint worklet.

### Using worklet
After our painter registered and loaded we can call it in CSS:

```css
.bars {
  height: 700px;
  max-height: 50vh;
  --bar-map: 50 #666, 70 salmon, 35 #9ee7a1, 15 rebeccapurple, 25 orange;
  --bar-gap: 20;
  background: #111 paint(bar-chart);
}

@supports not (background: paint(bar-chart)) {
  .bars:after {
    content: 'Your browser does not support CSS Paint API :(';
  }
}
```

We declared `--bar-map` and `--bar-gap` variables and call custom paint using `paint(bar-chart)`. We set solid background color as well. In addition I have added feature detection with `@supports` rule. Using this if browser hasn't support of CSS Paint API, it will show appropriate message to the user. Below is the video of the result.

INSERT VIDEO

### Improvements
We ha ve already created bar chart MVP and now is the time to think about its improvements. Actually there are a lot of points to improve and I am not going to cover all of them, if you want to implement more feel free to fork my repository and do it, just don't forget to share your ideas in the comments below and in social networks (in Twitter plz ping [me](https://twitter.com/bobrov1989)).

So the first point I want to do is to add possibility to define offsets for our chart. And I'm going to use `padding` property for that. Here is the updated painter class:

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
    const barWidth = (width - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barWidth + gap) + padding.left;
      const barHeight = data[i].value * multiplier;
      const y = domain - barHeight + padding.top;

      ctx.fillStyle = data[i].color;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
}
```

INSERT VIDEO

Now we are using padding values to calculate bar width and height. Next I want to add possibility to change chart orientation. I will introdue `--bar-orientation` variable with possible values: top, bottom, left and right. Here is the final code:

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
    const barWidth = (baseWidth - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barWidth + gap) + padding.left;
      const barHeight = data[i].value * multiplier;
      const y = {
        top: padding.top,
        right: domain - barHeight + padding.left,
        bottom: domain - barHeight + padding.top,
        left: padding.left
      }[position];

      ctx.fillStyle = data[i].color;

      if (vertical) {
        ctx.fillRect(x, y, barWidth, barHeight);
      } else {
        ctx.fillRect(y, x, barHeight, barWidth);
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
  --bar-map: 50 #666, 70 salmon, 35 #9ee7a1, 15 rebeccapurple, 25 orange;
  background: #111 paint(bar-chart);
}
```

INSERT VIDEO

As usual you can check [code](https://github.com/vitaliy-bobrov/css-paint-demos/tree/master/src/bar) and [demo](https://vitaliy-bobrov.github.io/css-paint-demos/bar/).

### Change input format
After thinking for some time I decided to change dataset input using "JS in CSS". Yes, you read it correctly, I want to use JavaScript inside CSS. As I said before Our worklet code executed in secure separate context and in this case is completely fine to use some JS as CSS variable value. Then I'm going to parse this value in custom painter using `JSON.parse`. Let look on stylesheet first:

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

So I defined JSON array with data objects in my CSS! Looks strange but more verbose then special string before. So now I can remove `_parseData` method from painter class and use `JSON.parse` instead:

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
    const barWidth = (baseWidth - (gap * (data.length - 1))) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * (barWidth + gap) + padding.left;
      const barHeight = data[i].value * multiplier;
      const y = {
        top: padding.top,
        right: domain - barHeight + padding.left,
        bottom: domain - barHeight + padding.top,
        left: padding.left
      }[position];

      ctx.fillStyle = data[i].color;

      if (vertical) {
        ctx.fillRect(x, y, barWidth, barHeight);
      } else {
        ctx.fillRect(y, x, barHeight, barWidth);
      }
    }
  }
}
```

How is it usefull? As we can get CSS variables in JavaScript, change the data and animate it! Than we need to call `JSON.stringify` and set the new value. Without JavaScript we can just swap the data, on hover for example:

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

INSERT VIDEO

Now let's try to animate dataset in JavaScript:

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
