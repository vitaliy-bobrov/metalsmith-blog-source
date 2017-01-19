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

## Hard way -- CMS
About 2 years ago, I tried to build my personal blog with [Wordpress](https://wordpress.org/). It is the choice of millions of websites and especially blogs. Because its first purpose is a simple and user-friend blogging platform. Yes, it has a big amount of free themes, plugins, resources, but... all most of this projects need a lot of work to adopt for my own needs. I can't say about all themes/plugins, but a lot of them haven't good code. Of course, Wordpress has its own code standards called [Codex](https://codex.wordpress.org/), but if you take a look at the code of some popular plugins, you'll see that they didn't implement this Codex.

As I see WP developer team concentrated only on front-end/user experience features. It seems to be logical because this is the killer-feature why users choose it. But PHP world also changed a lot for last few years and it'll be great to use PHP best-practices and great open-source projects. I understand that most of the users will not grasp and see this changes, but think they may feel them in performance and security improvements. Sorry WP lovers, but for me, it is not good enough.

Another platform that I tried to use for blogging was [Drupal](https://www.drupal.org/), the 7th. It is flexible, modular and has strict code standards. You'll never publish theme or module on `drupal.org` without passing automatical and human reviews. This process has its cons -- publishing time, especially first time will take a lot of time. This is not so good in so fast-changing web development. But my issue was related to the hard front-end part of Drupal 7. It generates a huge amount of unneeded markup that hard to control and override. In some cases, it is impossible to completely reduce it, because some theming parts need wrapper elements, etc. Drupal 7 is great, but front-end part is hard maintainable and requires a lot of customizations.

My hope was a completely new Drupal 8. Based on [Symfony](https://symfony.com/) with [Twig](http://twig.sensiolabs.org/) as a template engine, it promised to be flexible on front-end. Even the core team wrote about completely new and modern theming system. But the wonder won't happen. To be somehow backward compatible with Drupal 7, they decided to leave theming hooks/preprocessors in Drupal 8. Of course, it becomes much simpler to modify, but the developer needs to know from which part of applications come some class name, part of markup etc. So Drupal got a hard view layer again. Hope on Drupal 9...

## Harcore way -- custom project
Next not so good idea to create a blog was to write everything from scratch on [NodeJS](https://nodejs.org). In this case, I can do what I want and have full control on a project. I planned to use [Express](http://expressjs.com/) on back-end and [Polymer](https://www.polymer-project.org/) on client-side. But this variant requires a lot of free time, that I haven't. I'm only human, working in the office full-time, have a family and need time to spend with them. NodeJS is not about such static project as blogs. Each task has its own best instruments, and Node is great for some interactive projects, that need a lot of user interaction. According to blog, it can be just a comments, but in my opinion, it is not a good idea to build such project with it.

## Static web-site
After all my attempts, I've read the tutorial about [Jekyll](https://jekyllrb.com/). How easy it looks, just create a bunch of markdown files then a little bit of magic and you get a static website. Old cool buddies -- HTML, CSS and JavaScript. And that it. The only issue was that it build on top of Ruby. I had only a little experience with Ruby as "tool to generate SASS". It was dark old times before `node-sass` (formerly libsass) was created and saved a huge amount of time for me.

That is why I start looking for the similar tool as Jekyll but written with my favorite language -- JavaScript. And fortunately I found it, but as usual, in open-source community (especially JS one) there are a lot of static site generators. To be honest, I've read documentation most of them, but tried only a few, before choosing Metalsmith.

## Metalsmith
After trying some of the most popular static site generators, I fount most fittable one -- [Metalsmith](http://www.metalsmith.io/). It is really simple, extremely simple. It is the first thing maintainers write about the project:

> An extremely simple, _pluggable_ static site generator.

In general, Metalsmith is the module that operates with JavaScript objects and produces files in the end. It is pretty easy. Generator reads you files (markdown, HTML, whatever), creates a  objects tree and fill them with files metadata -- simple key-value pairs. Metadata could be provided with a plugin or inside files (for example as [YAML front matter](http://assemble.io/docs/YAML-front-matter.html)). And that's it. You can do what you want and how you want. No limitations anymore.

Most reasons to choose Metalsmith:
1. Simple and quick configuration
2. Modular and extensible
3. No limitations for technologies and structure
4. Fast deploy
5. Static site significantly fast

### Simple and quick configuration
Metalsmith builds to include plugins to generate the output according to source files. It exposes two ways to write generator config: JavaScript and JSON. It is up to you what to use, but JavaScript if preferable as this way gives the ability to generate parts of options on the fly depending on your needs. Basic config looks like this:

```js
const Metalsmith = require('metalsmith');

Metalsmith(__dirname)
  .metadata({ // Any key-value pairs to be added to any file.
    site: {
      url: 'https://my-static-site.io',
      title: 'My Static Site'
    }
  })
  .source('./source')
  .destination('./build')
  .build(function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log('Metalsmith build completed')
    }
  });
```

Probably this build will only move your files from source directory to destination. All other features are plugged with `use` method.

### Modular and extensible
Metalsmith API is pretty small and includes only 11 methods. All transformations will be done with plugins. When you are reading this article there are already more than 200 plugins listed on the official web-site. But some plugins aren't on this list yet. Event if you can't find any plugins that fit your project needs, nothing will stop you to write your own. Thanks to Metalsmith creator, plugin API in simple as possible. Here is some basic example:

```js
// Expose `plugin`.
module.exports = plugin;

const defaults = {
  // Your plugin default configuration.
}


function plugin(opts) {
  let config = Object.assign({}, defaults, opts)

  return (files, metalsmith, done) => {

    setImmediate(done); // Next plugin execution.

    Object.keys(files).forEach(file => {
      let data = files[file];

      if (data['my-metadata']) {
        // Do something.
      }
    });

  };
}
```

As you can mention you will operate with JavaScript objects, you can modify them as you want to get needed result. Detailed explanation how to write plugins is out of scope for this post, but you can find more in official documentation. I'll share my experience in plugins creation in one of my next articles.

### No limitations for technologies and structure
Nowadays every library, CSS or JavaScript framework provide us their own rules: where to store files, what we can implement and how etc. But with Metalsmith you are completely free in a decision. You may not include jQuery if you won't, use and styles preprocessor, any files structure, any build system. By the way, Metalsmith can be used as build system itself. Also, it can be a project scaffolder, e-Book or project documentation generator. You are not limited in templating engine selection, UI framework, content format.

The only issue that all this will require experience and knowledge from a developer. Such freedom always brings a responsibility for the final result. Fortunately, we have a lot of resources and helper tools to proof that things are done right. There is a great list of Metalsmith [awesomnesses](https://github.com/metalsmith/awesome-metalsmith), here you can find a lot of useful information about it.

### Fast deploy
Because everything that will be outputted by static site generator is just static files, you don't need to setup any back-end environment. Only static files server needed. Even you can use [GitHub Pages](https://pages.github.com/) to such purposes, it is free for a limited usage.

You don't need to maintain any database to store your content. For such thing I recommend you to use git, in this case, you'll also get a task and issue management, content versioning, collaboration for free. If you need to store some additional data, you can always try to use cloud-based service like [Firebase](https://firebase.google.com/). Need some comments? -- Just add [Disqus](https://disqus.com/) integration. This is just a few examples, but a lot of stuff possible to use on a service basis. Most of the services have a nice free usage quota. As a bonus -- static site are extremely secure in comparison to CMS or custom back-end.

### Static site significantly fast
The most important feature is that static site could be as performant as possible, because there is no back-end response waiting, just get resources without any delays. It is extremely good in the mobile-first internet era. Mobile traffic grows every year, that mean you won't users to load a huge amount of data and waste time to gain information. Also, you can there are ways to improve your content delivery, as for example, you can use CDN for making it faster. According to all fact, you might think about static site generator as a platform for your next project or migrate current one. If you interested in this idea I can recommend you to look on Metalsmith for this purpose.
