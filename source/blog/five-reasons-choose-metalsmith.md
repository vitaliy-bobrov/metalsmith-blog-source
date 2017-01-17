---
title: 5 Reasons to Choose Metalsmith
description: Why you midht choose static site generator for your next project?
ogimage: images/posts/five-reasons-choose-metalsmith/five-reasons-choose-metalsmith-og.jpg
tumb: /images/posts/five-reasons-choose-metalsmith/five-reasons-choose-metalsmith
created: 2017-01-15
categories:
- Metalsmith
- Blog
---
Few times I started to develop my personal blog locally, but only this implementation came to production. Previously I tried few CMS variants, other static site generators, but stop my decision on Metalsmith. I'll tell my story and try to argue why you might use Metalsmith for your next project.

## Hard way - CMS
About 2 years ago, I tried to build my personal blog with [Wordpress](https://wordpress.org/). It ischoise of millions of web-sites and especially blogs. Because its first purpose is a simple and user-friend blogging platform. Yes, it has a big amount of free themes, plugins, resources, but... all most of this projects need a lot of work to adopt for my own needs. I can't say about all themes/plugins, but a lot of them haven't good code. Of course Wordpress has its own code standards called [Codex](https://codex.wordpress.org/), but if you take a look on code of some popular plugins, you'll see that they didn't implement this codex.

As I see WP developer team concentrated only on front-end/user experience features. It seems to be logical, because this is the killer-feature why users choose it. But PHP world also changed a lot for last few years and it'll be great to usie PHP best-practices and great open-source projects. I understand that most of users will not understant and see this changes, but think they may feel tem in performance and security improvements. Sorry WP lowers, but for me it is not good enough.

Another platform that I tried to use for blogging was [Drupal](https://www.drupal.org/), the 7th. It is flexible, modular and has strict code standards. You'll never publish theme or module on `drupal.org` without passing automatical and human reviews. This process has it cons - publishing time, especially first time will tike a lot of time. This is not so good in so fast-changing web development. But my issue was related to hard front-end part of Drupal 7. It generates a huge amout of unneeded markup that hard to control and override. In some cases it is impossible to completely reduce it, because some theming parts need wrapper elements, etc. Drupal 7 is great, but front-end part is hard maintainable and require a lot of customizations.

My hope was a completely new Drupal 8. Based on [Symfony](https://symfony.com/) with [Twig](http://twig.sensiolabs.org/) as template engine, it promised to be flexible on frone-end. Even the core team wrote about completely new and modern theming system. But the wonder won't happen. To be somehow backward compatible with Drupal 7, they decided to leave theming hooks/preproccessors in Drupal 8. Of course it become much more simplier to modify, but developer need to know from which part of applications come some class name, part of markup etc. So Drupal got a hard view layer again. Hope on Drupal 9...

## Harcore way - custom project
Another not so good idea to create blog was to write everithing from scratch on [NodeJS](https://nodejs.org). In this case I can do what I want and have full controll on project. I planned to use [Express](http://expressjs.com/) on back-end and [Polymer](https://www.polymer-project.org/) on client-side. But this variant requires a lot of free time, that I haven't. I'm only human, working in the office full-time, have a family and need time to spend with them. Also NodeJS is not about such static project as blogs. Each task has its own best instruments, and Node is great for some interactive projects, that need a lot of user interaction. According to blog it can be just a comments, but in my opinion it is not good idea to build such project with it.

## Static web-site
After all my attempts, I've read tutorial about [Jekyll](https://jekyllrb.com/). How easy it looks, just create a bunch of markdown files then little bit of magic and you get static web site. Old cool buddies -- HTML, CSS and JavaScript. And that it. The only issue was that it build on top of Ruby. I had only little experience with Ruby as "tool to generate SASS". It was dark old times, before `node-sass` (formely libsass) was created and safed a huge amount of time for me.

That is why I start looking for similar tool as Jekyll, but written with my favorite language -- JavaScript. And fortunatly I found it, but as usual in open-source community (especialy JS one) there are a lot of static site generators. To be honest, I've read documentation most of them, but tried only few, before choosing Metalsmith.

## Metalsmith
After trying some of most popular static site generators, I fount most fittable one -- [Metalsmith](http://www.metalsmith.io/). It is really simple, extremely simple. It is the first thing maintainers write about the project:
> An extremely simple, _pluggable_ static site generator.
In general Metalsmith is the module that operates with JavaScript objects and produce files in the end. It is pretty easy. Generator reads you files (markdown, html, whatever), creates a  objects tree and fill them with files metadata -- simple key-value pairs. Metadata could be provided with a plugin or inside files (for example as [YAML front matter](http://assemble.io/docs/YAML-front-matter.html)). And that's it. You can do what you want and how you want. No limitations anymore.

### 1st reason
