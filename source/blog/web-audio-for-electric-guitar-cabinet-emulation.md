---
title: "Web Audio for Electric Guitar: Cabinet Emulation"
description: Want to know how to emulate top brand guitar amp or cabinet playing on electric guitar in a web browser? Read how to use convolution and Web Audio API to get a great sound.
ogimage: images/posts/web-audio-for-electric-guitar-cabinet-emulation/web-audio-for-electric-guitar-cabinet-emulation-og.jpg
tumb: /images/posts/web-audio-for-electric-guitar-cabinet-emulation/web-audio-for-electric-guitar-cabinet-emulation
created: 2019-06-17
updated: 2019-07-17
lastmod: 2019-07-17
categories:
- Guides
- Web Audio
---
It is hard to imagine a guitarist without any amplifier or guitar cabinet. Even more without any speakers, an electric guitar is hard to hear even at home. Today I want to show how to emulate guitar cabinet using Web Audio API. It is possible to recreate a sound made by top brand amp without the investment of thousands of dollars using convolution.

In the [previous post](https://bobrov.dev/blog/web-audio-for-electric-guitar-how-to-connect-instrument/), I described the process of getting sound from an electric guitar in a browser using Web Audio. Today I'm continuing that series with guitar cabinet emulation.

*This post is a part of "Web Audio for Electric Guitar" series, check out other posts as well!*

### Web Audio for Electric Guitar Series:{post__series}

1. [How to Connect Instrument](https://bobrov.dev/blog/web-audio-for-electric-guitar-how-to-connect-instrument/)
2. Cabinet Emulation -- Current
3. [Distortion](https://bobrov.dev/blog/web-audio-for-electric-guitar-distortion){post__series}

While playing on electric guitar at home, it usually connected to an individual device -- amplifier or head with a cabinet. There are a lot of famous amp producers, and each of them has its own "firm" sound. However, using digital sound processing, it is possible to emulate them programmatically using a process called *convolution*. For simplicity, you can imagine convolution as a multiplication of two functions. When we are speaking about sound convolution mean the application of some sample to the live input. To simulate a guitar cabinet, we need to apply such a short sample recorded from real device to guitar sound. That samples called *impulse response* (IR).

## Impulse Response
An impulse response is a recording of an amp impulse characteristics such as amplitude or frequency. For example, a photo is a snapshot of a light that the camera got on a film or digital matrix at some point. You can think about impulse response in the same way. It is a snapshot of a live speaker.

![AMP config panel](/images/posts/web-audio-for-electric-guitar-cabinet-emulation/img/amp-config-panel.jpg){js-lazy-load}

Unfortunately, that snapshot is limited to only one particular setting is recorded. What I mean by this is that on the real amplifier, you have a bunch of controls like volume or equalizer, and depending on amp configuration, you get different impulse response. So you can only simulate a device with a particular configuration. However, we can implement equalizer using Web Audio as well. Equalization gives us some flexibility to get the sound shape we want.

## Convolver Node
Now we have an idea what we want to perform, and it is time to learn how to implement that using Web Audio API. The API hides much heavy math behind nodes it provides. Convolution is not an exception -- we have a Convolver Node to apply impulse response to audio stream:

```js
const context = new AudioContext();
const convolver = new ConvolverNode(context);
```

The convolver node has a `buffer` option that is used to pass an impulse response audio buffer. You must load an audio file with the IR in a format browser understands. Modern browsers support different formats that happened because of those formats licensing. Modern browsers have excellent support of WAV (all except IE, that doesn't support Web Audio as well), AAC (Firefox supports it only in an MP4 container), MP3, FLAC, and OGG (all except IE and Safari). I considered staying with WAV as it is well-supported and is a lossless audio format. The quality is essential here because we are using a very short -- just a few bytes recordings and the compression could create artifacts in the output.

If you want to provide various file formats depending on the current browser you can check the support:

```js
const audio = document.createElement('audio');
console.log(audio.canPlayType('audio/wav')); // "maybe"

if (!audio.canPlayType('audio/wav')) {
  console.log('The format is not supported!');
}
```

All browsers, including IE 9+ support 'canPlayType' method. It returns a string with 3 possible values: `'maybe'`, `'probably'`, and `''`. Yes, it couldn't give you an exact answer 🤣, only probabilistic one. The empty string means that the format is not supported. `'maybe'` -- can't answer without starting playback, and `'probably'` -- seems to be possible.

![Real recording studio](/images/posts/web-audio-for-electric-guitar-cabinet-emulation/img/studio.jpg){js-lazy-load}

You might have a reasonable question where you can get those cabinets to impulse responses? You can "do it your self"™️ -- but this variant requires you to have a cabinet itself and a bunch of additional equipment, like capacitor microphone, professional audio card, and so far and so forth. Luckily there are a lot of free high-quality impulse responses made by professional studios and enthusiasts. Just google for "[free cabinet impulse response](https://www.google.com/search?q=free+cabinet+impulse+response&rlz=1C5CHFA_enUA690UA690&oq=free+cabinet+impulse+response)" to find and download one. If you are too lazy you can check the [impulses](https://github.com/vitaliy-bobrov/js-rocks/tree/master/src/assets/impulses/cabinet) I'm using for a "[JS Rocks](https://js-rocks.web.app)" app.

After we have an IR to work with, we can load and apply it to the Convolver Node using audio context and Fetch API:

```js
const convolver = new ConvolverNode(context);

fetch('impulse.wav')
  .then(response => response.arrayBuffer())
  .then(buffer => {
    context.decodeAudioData(buffer, decoded => {
    convolver.buffer = decoded;
  })
  .catch((err) => console.error(err));
});
```

*Note: it is essential to disconnect/connect Convolver Node after a new buffer set if you want to re-use the same node few times. If you set a new buffer on the connected node the old buffer will be used, and possibly you  get audio glitches.*

We fetched the impulse response file, then transform the response into array buffer. We can't apply that buffer directly on convolver, before that we need to decode it using context. When convolver configured you can chain it in your audio processing graph:

```js
guitarInput.connect(convolver).connect(context.destination);
```

Some IR could have a low amplitude, so after you apply it, they might reduce the overall volume. In this case, you can boost it using a Gain Node:

```js
const makeUpGain = new GainNode(context, {
  // Need to be adjusted to a particular IR.
  gain: 5
});

guitarInput
  .connect(convolver)
  .connect(makeUpGain)
  .connect(context.destination);
```

The gain value needs to be adjusted manually for a particular impulse response. It is also good to expose that configuration in the user interface with some control like range input.

## Three-band Equalizer
The last feature I want to add to cabinet emulation is a three-band equalizer. It gives us the tone control of the output. We want to create a configurable filter for bass, middle and treble frequencies. All below 500 Hz will is related to bass, between 500 Hz and 3 KHz to the middle, and above 3000 Hz to treble.

![Three-band equalizer frequencies split](/images/posts/web-audio-for-electric-guitar-cabinet-emulation/img/3-band-equalizer.jpg){js-lazy-load}

How can we increase the output of particular frequencies using Web Audio? We have a great node for that -- Biquad Filter Node. It is an implementation of a group of filters, that could be specified by provided type value. For bass control, we pick a `'lowshelf'` filter. It will increase the level of all frequencies below passed one. For treble, we use the opposite type -- `'highshelf'`. It boosts everything above the passed value. Moreover, for middle, we choose `'peaking'` type. It boosts frequencies around passed value -- the range of the band controlled by the `Q` (filter quality) parameter. Attenuation or boost for each band changed by gain parameter. It is an amount of level change in dB applied to the frequencies, using negative values we attenuate it, using positive -- boosting.

```js
const bassNode = new BiquadFilterNode(context, {
  type: 'lowshelf',
  frequency: 500
});

const midNode = new BiquadFilterNode(context, {
  type: 'peaking',
  Q: Math.SQRT1_2,
  frequency: 1500
});

const trebleNode = new BiquadFilterNode(context, {
  type: 'highshelf',
  frequency: 3000
});

// Decreasing bass level by 10 dB.
bassNode.gain.value = -10;

// Increasing middle level by 15 dB.
midNode.gain.value = 15;

// No boost.
trebleNode.gain.value = 0;
```

To prevent click on gain value updates it is possible to use `setTargetAtTime` update method:

```js
const level = 5;
const duration = 0.01;

midNode.gain.setTargetAtTime(level, context.currentTime, duration);
```

Now we can connect all the nodes to have a flexible guitar cabinet emulation:

```js
guitarInput
  .connect(convolver)
  .connect(makeUpGain)
  .connect(bassNode)
  .connect(midNode)
  .connect(trebleNode)
  .connect(context.destination);
```

I've recorded an example video showing how convolution affects the output sound. It might not have a significant impact on a clean signal, but if some distortion effect applied, it is much more noticeable.

[](youtube:0KK6D2h7RgU)

## Recap
If you read that post to that point, you learned how to emulate a guitar amp using convolution, and create a three-band equalizer to configure tone. If you are playing guitar, you can check out the ["JS Rocks"](http://js-rocks.web.app) Angular app I've built. It has 9‼️ of ready-to-use cabinets and  7 effects for electric guitar created with Web Audio. Moreover, it sounds well 😎. Stay tuned in the next post I'm going to make a deep dive into [distortion effects](https://bobrov.dev/blog/web-audio-for-electric-guitar-distortion). Rock it with Web Audio 🤘!




