---
title: "Trying Paint Worklet in Safari Technology Preview"
description: "As a big fan of CSS Houdini, I was so happy that Safari team decided to take Paint API in development. The first implementation was shipped with Safari Technology Preview (TP) 69. But in the version 72 release the changelog I saw exciting news -- it is possible to pass <image> as an input property to the Paint Worklet. I wanted to play with it here and now. Unfortunately, it wasn't that easy."
ogimage: images/posts/trying-paint-wroklet-in-safari-tp/trying-paint-wroklet-in-safari-tp-og.jpg
tumb: /images/posts/trying-paint-wroklet-in-safari-tp/trying-paint-wroklet-in-safari-tp
created: 2018-12-21
updated: 2018-12-22
lastmod: 2018-12-22
categories:
- Tips & Tricks
- Houdini
---
As a big fan of CSS Houdini, I was so happy that Safari team decided to take Paint API in development. The first implementation was shipped with Safari Technology Preview (TP) 69. But in the version 72 release the changelog I saw exciting news -- it is possible to pass `<image>` as an input property to the Paint Worklet 🤩. I wanted to play with it here and now. Unfortunately, it wasn't that easy.

## Initial setup
the first challenge was to make an initial setup 🤓. You can't find Safari TP in App Store, you need to download it manually from [developer.apple.com](https://developer.apple.com/safari/download/). The good thing is that it should get updates from the App Store. Then you need to find how to enable experimental API. As a Chrome user I've started to look for some flags settings tab, but no luck. To enable Paint API in Safari TP you need to go to *"Develop"* ➡ *"Experimental Features"* menu and toggle *"CSS Painting API"* option. Before I was going to start my experiments, I decided to try demos I've [created](https://vitaliy-bobrov.github.io/blog/exploring-the-css-paint-api/) before. They were working in Chrome, but some of them need Chrome Canary because some of the other Houdini parts are used there. So I've navigated to the basic [Paint Worklet demo](https://vitaliy-bobrov.github.io/css-paint-demos/hello-world/)... and it was dead 😭.

## Dead demos inquiry
Instead of four circles, there was the white background on the screen. That means that fallback value hasn't applied, because I've used black color for it. That is interesting 🧐. When I've opened the inspector, I saw that background with `paint` function was applied to the element. Then I opened the console and there was an error -- `ReferenceError: Can't find variable: paint`. That was confusing, I haven't used any variable called "paint" in the Worklet class definition. So I've tried to load it manually in the console:

```js
CSS.paintWorklet.addModule('paint.js');
```

And got the same error again. Hm, `addModule` method should accept the path to the file with the custom painter implementation. There is a security-related restriction, similar to Web and Service Workers, that all Worklets code should be written in a separate file. They have completely different JavaScript context and shouldn't have access to any global data. So I've tried different path variation:

```js
CSS.paintWorklet.addModule('/paint.js');
```

I've got the error again, but a different one -- `SyntaxError: Unterminated regular expression literal '/paint.js'`. Seems that the function tried to interpret path as a code. There were links to the changed Safari source code in the [release notes](https://webkit.org/blog/8547/release-notes-for-safari-technology-preview-72/). So I've decided to find an explanation there. Like Chrome, Safari wrote in C++. I'm not a big expert in this language, but at least can understand what is going on.

## Source code Safari
I've started exploration opening links to changes related to Paint API. The first thing I checked was tests as they are the best source of truth for the current implementation. They were just HTML files and looked like that (I've made example shorter to show the main points):

```html
<script id="code" type="text/worklet">
class MyPaint {
  paint(ctx, geom) {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, geom.width, geom.height);
  }
}
registerPaint('my-paint', MyPaint);
</script>

<script type="text/javascript">
  importWorklet(
    CSS.paintWorklet,
    document.getElementById('code').textContent
  );
</script>

<style>
  #paint {
    background-image: paint(my-paint);
    width: 150px;
    height: 150px;
  }
</style>

<div id="paint"></div>
```

The Worklet code was stored in the script tag with custom mime type "text/worklet" and then the text content was passed to the `importWorklet` helper. It confirmed my guesses and I continued with source code lookup. After some time I've found the great comment in [Worklet.cpp](https://trac.webkit.org/browser/webkit/trunk/Source/WebCore/worklets/Worklet.cpp?rev=239067) file:

```js
// FIXME: We should download the source from the URL
// https://bugs.webkit.org/show_bug.cgi?id=191136
```

So I've followed the [link to the bug](https://bugs.webkit.org/show_bug.cgi?id=191136) in WebKit Bugzilla. The comment explained everything:

>Currently, a call to Worklet::addModule(String url) uses the url as code. It should fetch the script asynchronously, following the spec. -- Justin Michaud 2018-10-31 15:12:30 PDT

Instead of fetching the file `addModule` method parsed the code from a string 🤦‍♂️.

## Workaround
My finding meant that I need to transform my JS files with painters into a string, but for Safari only. Until they will implement the method according to the [spec](https://www.w3.org/TR/css-paint-api-1/). There are a few possible solutions:

1. Write code as a string 😅
2. Write code inside script tag with a custom mime type 🤡
3. Fetch JS files manually and transform to a string 🤠

I decided to go with the third option. I want to detect Safari browser, made a request for a script, and convert it to a string.

### Detect Safari
In the current version of demos, I've used feature detection, before registering Paint Worklet:

```js
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('paint.js');
}
```

After that, I need to detect Safari browser. After a short investigation, I've used the next user agent check snippet:

```js
if ('paintWorklet' in CSS) {
  if (navigator.userAgent.includes('Safari')
    && !navigator.userAgent.includes('Chrome')) {
    // Safari TP fix will be here.
  } else {
    CSS.paintWorklet.addModule('paint.js');
  }
}
```

This is slightly confusing, but Safari's user agent should contain "Safari", but not "Chrome". Because Chrome has both of them 🤣.

### Request the file
This is the easiest task, as Safari support most of the modern JavaScrip features. I used Fetch API to request the file. Then I parsed the response as `Blob`:

```js
(async function() {
  const response = await fetch('paint.js');
  const blob = await response.blob();
})();
```

 We are not allowed to use `await` outside asynchronous functions, that is why I wrapped the call in async IIFE.

 ### Convert file to a string
 The simplest way to transform `Blob` into a string, I've found, was to use File Reader API. The semantics of this API looks different from modern ones as it is pretty old. First, we need to create `FileReader` instance. Then listen to the "load" event. Only after that, we can start the reading process:

 ```js
const reader = new FileReader();

reader.addEventListener('load', () => {
  CSS.paintWorklet.addModule(reader.result);
});

reader.readAsText(blob);
 ```

 This was the final stage after that almost all demos worked in Safari 🎉. Some issues still there and I'm going to fix them in the nearest time. It was a fun journey, but as I've found in the source code, Safari team implemented a lot of features that are not finished in Chrome Canary. But this is a completely different story and I will definitely share my experiments in the nearest future. Here is the resulting loading code:

 ```js
if ('paintWorklet' in CSS) {
  // Safari TP fix.
  // Safari only accepts source code as a string instead file path.
  if (navigator.userAgent.includes('Safari')
    && !navigator.userAgent.includes('Chrome')) {
    (async function() {
      const response = await fetch('paint.js');
      const blob = await response.blob();
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        CSS.paintWorklet.addModule(reader.result);
      });

      reader.readAsText(blob);
    })();
  } else {
    CSS.paintWorklet.addModule('paint.js');
  }
}
 ```

## Conclusion
Making something undocumented and experimental is always a nice way to explore the Web platform APIs. And the most important it learns us to keep comments and tests up-to-date as they are the main source of truth. Have fun 👻!

