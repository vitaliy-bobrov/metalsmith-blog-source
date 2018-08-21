---
title: Adding NgRx to an Angular Project using Schematics
description: "NgRx is the great way to manage complex app state. Unfortunately, it requires so much boilerplate code. NgRx Schematics is a huge time-saver. It will automate NgRx code generation and give you the ability to focus on application business logic."
ogimage: images/posts/ngrx-with-schematics/ngrx-with-schematics-og.jpg
tumb: /images/posts/ngrx-with-schematics/ngrx-with-schematics
created: 2018-08-21
updated: 2018-08-21
lastmod: 2018-08-21
categories:
- Angular
- NgRx
---

NgRx is the great way to manage complex application state. Unfortunately, as a downside, it requires a lot of boilerplate code. NgRx Schematics package is a huge time-saver. It will automate NgRx code generation and give you the ability to focus on application business logic.

First of all, I want to admit that I'm not going to tell you about NgRx platform or Redux pattern. I'm assuming that you already familiar with it. Instead I will focus on `@ngrx/schematics` library and how it could help to add NgRx into your Angular project. If you want ot learn more about NgRx, I'd like to recomment to check next resources: [NgRx blog](https://medium.com/ngrx), [Angular in Depth](https://blog.angularindepth.com/), [Victor's Savkin blog](https://medium.com/@vsavkin).


Libraries versions used: `@angular/cli` 6.1.4, .{post__series}

Previously, I did a few talks about NgRx schematics at ng-conf and ngHouston, but time going and NgRx changed a lot during this time. As I did previously, I will show `@ngrx/schematics` in action on "Star Wars Knowledge Base" example app. You can find the final code and instructions on [GitHub](https://github.com/vitaliy-bobrov/ngrx-swkb). It shows use-case that is close to the real applications we are developing at work. Usually modern web apps fetching some data from the API, format if and show to the end user. In my opinion standard Redux counter or ToDo list don't are too abstract to understand technology. So let's start 🏁!

## WTF Schematics?
I want just give you brief background about Schematics. I think everyone used generator commands provided by Angular CLI. The core functionality behind them is `@angular-devkit/schematics`. Initially it was hard-wired part of CLI itselt. Later it that functionality was extracted from `@angular/cli` into separate project by initiative called Angular Labs. Schematics is just a bunch of tools to work with file system. It is 100% framework agnostic.

## Create the application
First, we need to create application sceletone of our future knowledge base app. And to do so, I want ot use Angular CLI. I recommend to use it instead custom webpack build for few reasons. But main of them that bundler configuration is not a part of solution implementation. Sometimes you could waste several days tweaking webpack config, but at the same time do nothing useful for the busyness.

Before you can use Angular CLI, you need to install it globally:

```bash
npm i -g @angular/cli
```

This will give you access to the global `ng` terminal command. I usually change global options for the CLI to use `yarn` instead `npm`:

```bash
ng config -g packageManager yarn
```

To generate a new project we need to use `ng new` command:

```bash
ng new swkb -p=swkb --style=scss
```

So I called our new application as "swkb" that stands for "Star Wars Knowledge Base". Using `-p=swkb` I set default prefix for all components and directive we will generate in the future. And `--style=scss` sets default CSS files extension.

After installation process we can switch to the newly created folder:

```bash
cd swkb
```

And we are done with the first step. We have standard Angular application created.

## Creating base app structure

