---
title: "Web Audio for Electric Guitar: Distortion"
description: Want to know how to create distortion, overdrive, and
ogimage: images/posts/web-audio-for-electric-guitar-distortion/web-audio-for-electric-guitar-distortion-og.jpg
tumb: /images/posts/web-audio-for-electric-guitar-distortion/web-audio-for-electric-guitar-distortion
created: 2020-01-27
updated: 2020-01-27
lastmod: 2020-01-27
draft: true
categories:
- Guides
- Web Audio
---
Nobody could imagine rock music without distortion effect. Overdrive and distortion stompboxes are most widely used guitar effects. Today I want to show how to implement that effect using Web Audio API 🎛!

*This post is a part of "Web Audio for Electric Guitar" series, check out other posts as well!*

### Web Audio for Electric Guitar Series:{post__series}

1. [How to Connect Instrument](https://bobrov.dev/blog/web-audio-for-electric-guitar-how-to-connect-instrument/)
2. [Cabinet Emulation](https://bobrov.dev/blog/web-audio-for-electric-guitar-cabinet-emulation/)
3. Distortion -- Current {post__series}

## What is Distortion?
Distortion is an audio effect that is widely used in rock music (but not only) to create heavy guitar (or bass) sounds. The sound wave get damaged going thought the effect pipeline and become saturated with new harmonics. Harmonics are additional waves summed together to get more complex wave shapes. It is a big separate topic, but you can find a lot of information about it, I could recommend to read about harmonics [here](https://blackstoneappliances.com/dist101.html). It is way easier to get the idea of distorted signal with illustration of a clean and distorted sound waves.

![Sine vs clipped signal graph](/images/posts/web-audio-for-electric-guitar-distortion/img/clipping.jpg){js-lazy-load}

As you can see, the original signal gets clipped, means it's amplitude get cut at some threshold. The flat cut-off called hard clipping, the rounded -- soft clipping. In analog pedals and amplifiers there are a bunch of ways to get signal saturation using diodes, transistors or tubes. I won't cover that details here, just mention it. However doing digital versions of the old classics requires some knowledge regarding how sound wave is clipped. You can find such information on resources like [Electro Smash](https://www.electrosmash.com/boss-ds1-analysis).

![Boss DS-1 schematic from https://www.electrosmash.com](/images/posts/web-audio-for-electric-guitar-distortion/img/boss-ds1-distortion-schematic-parts.jpg){js-lazy-load}

Actually distortion is not an only effect, but a group of effects - overdrive, distortion and fuzz. The main difference between them is how hard they transform the original sound. Overdrive boosts your electric guitar gain and applies soft clipping. The clipping level depends on how hard you play on instrument, plus how it get boosted before the clipping stage. Distortion heavily saturates sound and gives the same amount of the effect no matter how loud you are playing, that is called compressed. Fuzz takes distortion to the next level making wave almost square, so it sounds like if you amp is broken.

![Comparison graphs of overdrive, distortion and fuzz clipping](/images/posts/web-audio-for-electric-guitar-distortion/img/overdrive-dist-fuzz-clip.jpg){js-lazy-load}

It is hard to describe a sound with words, so I put samples of each effect to get better understanding:

- Overdrive
- Distortion
- Fuzz

With help of different type of distortion applied to the sound you can play a huge range of music, starting from blues and ending with heavy metal 🤘. In this post we will focus on distortion, I will leave fuzz and overdrive for a separate posts.

### History
![Dunlop Fuzz Face](/images/posts/web-audio-for-electric-guitar-distortion/img/fuzz-face.png){js-lazy-load align-left shape shape-circle}

Before we will start digging into distortion internal implementation, I want to give you a introductory history of how it was invented. Back in late 1940s guitarists noticed that tube amplifier gives "interesting" sound when used at extreme volume levels. Tubes has it's voltage range to work normally, but when you pass more power though it the sound starting to clip. Even more sound will be clipped in a soft way, cleating nice sounding harmonics. So musicians started to overdrive tube amps to get such distorted sound.

In early 1950s some guitarists accidendially used amplifiers with damaged speaker. Broken speaker produced a cool buzzy sound, so musicians started to damage speakers themself to get such an effect in recordings. Only in 1960s manufactures introduced a pedals with very first fuzz effects: Maestro Fuzz-Tone, Tone Bender, Fuzz Face.

![Ibanez TS808 Tube Screamer](/images/posts/web-audio-for-electric-guitar-distortion/img/ibanez-ts808.png){js-lazy-load align-right shape shape-parallelogram}

In 1970s world entered a new rock era with pedals that tried to achieve the sound of tube amp -- overdrives. At that time legendary stompboxes like Ibanez Tube Screamer and BOSS OD-1 OverDrive was introduced.

1980s started the decade of heavy metal bands. More heavier music styles required more gain than overdrive can give and more readable sound than fuzz pedal could do. Electronics had evolved a lot, so companies started production of such classic distortions as MXR Distortion+, ProCo RAT and BOSS DS-1.

With evolution of music and styles people still trying to find own "that" sound. Nowadays a lot of new, more versalite and heavier distortions are done, but a lot of them still based on classic ones schematics and ideas. However some effects are radically new, like Plasma by Gamechanger Audio.

![Gamechanger Audio Plasma Pedal](/images/posts/web-audio-for-electric-guitar-distortion/img/plasma-pedal.jpg){js-lazy-load clear}

## Implementation ways
It was enough history and facts about analog distortion pedals, but how we can make something similar in digital world? More specially using Web Audio. To answer that question I would like to take a look at analog effect schematic stages and pedal controls. Standard distortion stompbox has at least 3 knobs: level (could be called volume), tone (sometimes called filter), and gain. Level control could be used to control signal boost before it will be clipped. Sound with wider amplitude will be more saturated and compressed at the end. Gain control is used for amount of clipping and distortion of the signal. Tone is used to share the sound after it was distorted.

![Distortion (BOSS DS-1) controls](/images/posts/web-audio-for-electric-guitar-distortion/img/distortion-controls.jpg){js-lazy-load}

In general the stages of distortion schematic consists of: input boost stage, clipping stage, and tone stage. So in digital world we can first make signal louder using `GainNode`. Optionally we can filter input signal with lowpass and highpass filters, that gives a control what frequencies will be passed to the clipping stage. The thing is that very low and very high frequiencies distortion could sound unpleasant for our ears, so it is quite common to filter them out beforehand.

Then the signal goes to the heart of the effect -- clipping stage. There are bunch of ways to do clipping in digital processing. For example we can use IIR (Infinite Response) filters to emulate op-amp or JFET clipping. Or we can use basic wave shaping of the signal using `WaveShaperNode` and precalculated look-up table of values. Or we can split signal into few frequency bands and saturate them in parallel, then combine them back into one signal. In that post we will use wave shaping as it is the easier technique to use in Web Audio.

Final and in most important part of the effect is a tone control. This stage is the place where the soul of distortion is created. Different clipping stages could sound pretty similar, however the significant difference post-filtering could do, creating unique texture of the sound. The basic tone control could be a lowpass filter with cut-off frequency controlled by a knob. More advanced pedals could have separate controls for bass, treble and middle.

## Distortion
As we already know stages of the effect we could start to implement them one by one. The first stage is a boost, just a single `GainNode`. Usually distortion pedals increase volume more than 10 dB, let try to use +15 dB:

```js
const context = new AudioContext();
const boost = new GainNode(context, {gain: dBToGain(15)});
```

We can use a simple utility function to convert dB to Web Audio gain value:

```js
function dBToGain(value: number) {
  return Math.pow(10, value / 20);
}
```

Before signal saturation lets filter it using `BiquadFilterNode`, more specially lowpass nad highpass filters. Highpass filter could be set at 200 Hz to cut bassy frequencies that could sound muddy when distorted. Lowpass could be set at 5 KHz as clipping creates a lot of new harmonics and those harmonics could have frequencies higher that original signal and sound harsh. Those frequencies could be adjusted to your taste or exposed as a controls for the user.

```js
const preHP = new BiquadFilterNode(context, {
  type: 'highpass',
  frequency: 200,
  Q: Math.SQRT1_2
});

const preLP = new BiquadFilterNode(context, {
  type: 'lowpass',
  frequency: 5000,
  Q: Math.SQRT1_2
});
```
Now we have signal prepared to the heard of the effect -- wave shaping.

## Recap
