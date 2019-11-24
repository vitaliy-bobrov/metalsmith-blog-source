---
title: "Web Audio for Electric Guitar: How to Connect Instrument"
description: Want to connect your electric guitar in a browser using Web Audio API? This short tutorial shows how to do it! You will learn how to request audio access, convert it into an audio stream and control volume.
ogimage: images/posts/web-audio-for-electric-guitar-how-to-connect-instrument/web-audio-for-electric-guitar-how-to-connect-instrument-og.jpg
tumb: /images/posts/web-audio-for-electric-guitar-how-to-connect-instrument/web-audio-for-electric-guitar-how-to-connect-instrument
created: 2019-06-11
updated: 2019-07-17
lastmod: 2019-07-17
categories:
- Guides
- Web Audio
---
Modern Web becomes more and more powerful, especially with APIs giving developers access to hardware. One of such API -- Web Audio. It gives you a set of low-level features to generate or process music right in your browser. Today I want to show you how to connect your electric guitar 🎸 (or any other electric instrument with wire connection, ex. bass) in a browser and control its volume level.

*This post is a part of "Web Audio for Electric Guitar" series, check out other posts as well!*

### Web Audio for Electric Guitar:{post__series}

1. How to Connect Instrument -- Current
2. [Cabinet Emulation](https://bobrov.dev/blog/web-audio-for-electric-guitar-cabinet-emulation/)
3. [Distortion](https://bobrov.dev/blog/web-audio-for-electric-guitar-distortion)
{post__series}

I am playing a bunch of instruments, including some very unusual, like [bandura](https://en.wikipedia.org/wiki/Bandura) 🤯, but my favorite one is a guitar. At my teenage years, I've used to play at punk-rock bands 🤘 at school and university. I'm not a professional guitarist, and it is just my hobby that helps to relax and clean my mind after work. Web Audio allowed me to combine programming and music, so I've started experimenting with it. The very first task to do that was how to connect my instrument to the laptop.

![Me playing punk rock at age of 16](/images/posts/web-audio-for-electric-guitar-how-to-connect-instrument/img/punk-rock-band.jpg){js-lazy-load}

## Hardware
Before writing any code, you need a few things: a laptop, an instrument (electric guitar in my case) and an audio interface. The last part is crucial. Of course, you can plug your instrument directly to the audio input of your computer, but it has a bunch of downsides. First, it might require an adapter. Usually, laptops have only 3.5mm jack, but 6.4mm cables used for instruments. Second, the quality of built-in audio cards is not usually suitable for playing music -- in most cases, producers think that users use it for music, movies, and games. You should expect a high latency of an audio stream. Moreover, the last argument in favor of functional interface, that build-in solutions might be damaged on hard input levels. I did that when I was young 😱.

Fortunately, you can buy a cheap and good-to-start device just for 20-25$. I'm using the most popular and quite cheap one -- Behringer UCG-102 Guitar Link (this is not an advertisement!). It gives a low latency, has 6.4mm jack input and output, connects via USB and doesn't require any particular setup to work on Mac (on Windows you might need to install `asio4all` driver to achieve good results). You can see it among my devices on the photo below.

![My Web Audio devices: Squier by Fender Mustang, Behringer UCG-102, MacBook Pro, cables, picks](/images/posts/web-audio-for-electric-guitar-how-to-connect-instrument/img/web-audio-kit.jpg){js-lazy-load}

You can buy something more fancy and better, but this audio interface is good to start with, you can always upgrade it if you ever need it.

You need to connect your device to the computer, connect the instrument to the interface. Then you need to make sure that your system audio input and output setup is correct. You must select an external audio card as input and select built-in one as an output.

*Note: if you want to use Bluetooth headphones to play, I'd like to recommend to use an only wired connection, at least when I used Marshall MID the latency was so huge that I couldn't play anything, they worked fine for me to listen to the music. It might be only my specific problem, but when trying to use Web Audio at first time try not to use wireless speakers or headphones, as they might add latency and make you think Web Audio API to be slow.*

## Web Audio Context
Before you request user audio input, you need to create a Web Audio context -- the main point to create any nodes and work with APIs. Web Audio, in general, is a uni-directed graph of individual audio nodes. Connecting and changing their parameters, you could create effects pipeline or generate sound. That graph should have some input, in our case audio stream from the guitar signal.

![Web Audio graph representation](/images/posts/web-audio-for-electric-guitar-how-to-connect-instrument/img/web-audio-graph.jpg){js-lazy-load}

To produce any noise or sound out, the input should be connected to the output. Usually, it is a context destination -- the output device configured in the system. You can imagine it as a standard guitar stack. We have a guitar that could be connected to a line of stompboxes (guitar pedals), and at the end, you connect it to an amplifier or cabinet.

![Guitar stack schema](/images/posts/web-audio-for-electric-guitar-how-to-connect-instrument/img/guitar-stack.jpg){js-lazy-load}

Sometimes, for ease of use, it is helpful to draw a graph before implementing any complex effect.

Let's create the audio context, to do so we need to use a constructor that returns context:

```js
const context = new AudioContext();
```

The friend of mine [Reactive Fox](https://twitter.com/thekiba_io) pointed me that you might have a problem with an audio context that created without any user interaction, ex. click. Browsers could set such context in a suspended state; you can read about it in details [here](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio). To prevent such issues, you need to make sure that the context is in the active state using the following code:

```js
if (context.state === 'suspended') {
  await context.resume();
}
```

*Side note: I've used TypeScript while working with Web Audio and it saved me much time of searching through the documentation. It is not required to use TypeScript, but I can say it might make your life way easier.*

## Request audio stream
After we created an audio context, we are ready to request user input with `getUserMedia` API. In the past, this method was located on `navigator` object, but the specification was changed, and now it is on `navigator.mediaDevices`. Keep this in mind if you're going to support legacy browsers.

```js
const stream = await navigator.mediaDevices
  .getUserMedia({audio: true});
```

By default, browsers might apply sound optimization to the stream -- echo cancellation, noise suppression, and auto gain control. Those optimizations are suitable for a microphone but not for a live instrument. To disable them, you need to pass an object with audio constraints instead of `true`:

```js
const stream = await navigator.mediaDevices
  .getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0
    }
  });
```

After the call of the method, the user will be asked for permission to allow audio input and output. You can request those permissions manually using `Permissions API`, but that feature is not fully supported right now. For now, you're allowed to check permission status and reset it.

```js
// Getting permission status.
const micStatus = await navigator.permissions.query({name: 'microphone'});

console.log(micStatus); // state: "prompt"

// Reset permission to initial state.
await navigator.permissions.revoke({name: 'microphone'});
```

*Note: `getUserMedia` user media requires your app to be hosted via secure connection -- HTTPS. If your local or deployed app is running using HTTP, you might need to grant permissions using web site settings in a browser manually.*

Ok, we requested an audio stream, what next? We need to create a media stream source and pass that stream to the audio context. However, to get any sound from the speakers, we must connect our source to destination node:

```js
const lineInSource = context.createMediaStreamSource(stream);

lineInSource.connect(context.destination);
```

And 🥁... now you should hear sound from the guitar in your browser -- congratulations 🎉! Let's put it all together:

```js
const context = new AudioContext();

if (context.state === 'suspended') {
  await context.resume();
}

const stream = await navigator.mediaDevices
  .getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0
    }
  });
const lineInSource = context.createMediaStreamSource(stream);

lineInSource.connect(context.destination);
```

To disconnect your guitar, you need to call `disconnect` method on your source node:

```js
lineInSource.disconnect();
```

## Volume control
The last basic thing I want to show in this post -- volume control. Web Audio provides us with a gain node. It has only one parameter -- gain. This parameter accepts any numeric value. The zero gain means muted sound, 1 means normal, the same volume level. You could use values bigger than 1 to amplify original sound; for example, the value of 2 will boost volume in two times. You can create a gain node using a factory method on audio context or using constructor. The main difference between those methods that constructor allows you to pass initial configuration parameters, at the same time, you create an instance. Let's see it in code:

```js
// Create a gain node and set the initial value to 0.5
// that means that volume will be haft of the original.
const gainNode = new GainNode(context, {gain: 0.5});

// Disconnect source before constructing a new graph.
lineInSource.disconnect();

// Connect nodes
lineInSource.connect(gainNode).connect(context.destination);

// Increasing volume.
gainNode.gain.value = 2;
```

Few points to explain here, you can chain connect methods, as they are returning the node you connected to during the previous call. You can assign value to gain node, but you might notice clicking on value changes. Those "clicks" are artifacts of discrete gain changes. Fortunately, Web Audio nodes have a bunch of methods to set values smoothly:

```js
// Setting target value (1st argument) starting from
// the current time in 0.01 second period
gainNode.gain.setTargetAtTime(2, context.currentTime, 0.01);

// Doing the same but exponentially.
gainNode.gain.exponentialRampToValueAtTime(gain, context.currentTime + 0.01);
```

Using those methods, you will avoid sound glitches. To update a value of the volume in a user interface you need some control, the most suitable one for that purpose is a range input:

```html
<input
    class="gain-control"
    type="range"
    min="0"
    max="1"
    step="0.01"
    value="0.5">
```

You can listen to the changes in the input to update the gain value. Note, that you will need to validate (at least clamp) and parse the value, cause inputs value is always a string.

```js
const control = document.querySelector('.gain-control');

control.addEventListener('change', (event) => {
  const parsed = parseFloat(event.target.value);
  const value = Number.isNaN(parsed) ? 1 : parsed;
  const clamped = clamp(value);

  gainNode.gain.setTargetAtTime(clamped, context.currentTime, 0.01);
});

function clamp(min, max, value) {
  return Math.min(Math.max(value, min), max);
}
```

## Recap
If you read that post to that point, you learned how to create an audio context, request media stream from a browser, connect it to the output, and control its volume. If you are playing guitar, you can check out the ["JS Rocks"](http://js-rocks.web.app) Angular app I've built. It has a bunch of ready-to-use cabinets and effects for electric guitar created with Web Audio. Moreover, it sounds well 😎. Stay tuned in the [next post](https://bobrov.dev/blog/web-audio-for-electric-guitar-cabinet-emulation/) I'm going to show how to emulate a real guitar cabinet. Rock it with Web Audio 🤘!
