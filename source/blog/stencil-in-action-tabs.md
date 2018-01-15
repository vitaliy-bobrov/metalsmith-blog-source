---
title: "Stencil in Action: Tabs"
description: Try Stencil by practical implementation of such commonly used component as tabs.
ogimage: images/posts/stencil-in-action-tabs/stencil-in-action-tabs-og.jpg
tumb: /images/posts/stencil-in-action-tabs/stencil-in-action-tabs
created: 2018-01-15
categories:
- Stencil
- Web Components
---
Stencil is an awesome compiler for Web Components with superpowers. It got the best modern JavaScript features. Stencil is still pretty new technology and in my opinion the best way to try something new is to make hands dirdy. Today we will implement simple tabs component with it.

I think that peopkle should stop create ToDo applications to show new technology features. Such examples usualy have nothing in common with real life development. Like Redux examples with counters they show nothing related to business tasks. What I'm going to do instead during this article is to build some reusable component. One of such we're probably using in bunch of work projects - tabs.

## Tabs design
The main goals during implementation of tabs, that I want to care about:
- Simple public API
- Easy to style
- Ability to insert any content
- Nice defaults that could be overwritten

