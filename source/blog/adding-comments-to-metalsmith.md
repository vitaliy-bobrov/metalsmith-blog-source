---
title: Adding Comments to Metalsmith
description: "Comments are the vital part of communication with the audience. It fits for a lot type of websites starting from blogs finishing with e-commerce. Metalsmith is a static site generator, that means that developer doesn't want to have a database and other back-end infrastructure to implement commenting functionality."
ogimage: images/posts/adding-comments-to-metalsmith/add-comments-to-metalsmith-project-og.jpg
tumb: /images/posts/adding-comments-to-metalsmith/add-comments-to-metalsmith-project
created: 2017-01-30
updated: 2018-02-18
lastmod: 2018-08-14
categories:
- Guides
- Metalsmith
---

Comments are the vital part of communication with the audience. It fits for a lot type of websites starting from blogs finishing with e-commerce. Metalsmith is a static site generator, that means (in most cases) that developer doesn't want to have a database and other back-end infrastructure to implement commenting functionality. But it not says that you can't add it.

Some services provide commenting widgets as a service in web. The most widely-used and famous of them -- [Disqus](https://disqus.com/). With it, you will not care about a lot of complicated things related to comments. So what they offer to you:
- Commenting widget
- Real-time comments updates
- Comments counter widget
- Spam filtering
- Moderation tool
- Design adapting to your website
- Media resources support

The site registration is pretty simple, just visit Disqus [webpage](https://disqus.com/profile/signup/intent/) and follow the instructions.

## Integrate with Metalsmith
Metalsmith was created as flexible as possible, and it has a little core functionality. Any additional feature could be implemented as a plugin. So to simplify Disqus integration I created [plugin](https://github.com/vitaliy-bobrov/metalsmith-disqus) -- `metalsmith-disqus`.

[Star on GitHub](https://github.com/vitaliy-bobrov/metalsmith-disqus)
{star-me}

### Installation
The installation process is pretty simple, just run the command in your terminal:

```bash
npm install --save-dev metalsmith-disqus
```
### Plug into Metalsmith build
The plugin needs HTML markup to be already generated for its work because it will look for elements with configured class names and add Disqus scripts, meta tags to your page. So you need to place it after markdown files are processed, for example after `metalsmith-layouts` plugin:

```js
const Metalsmith = require('metalsmith');
const layouts    = require('metalsmith-layouts');
const disqus     = require('metalsmith-disqus');

Metalsmith(__dirname)
  ...
  .use(layouts())
  .use(disqus({
    siteurl: 'my-site.com',
    shortname: 'my-site'
  }));
```

### Required options
You need to specify two required configuration options -- `siteurl` and `shortname`. `siteurl` -- needed to generate absolute URL for your pages. That is required for proper Disqus widget configuration. `shortname` is the same name that you received during website registration in Disqus admin. Disqus gives the links to widgets based on your shortname sub-domain. All other options are optional, if not specified plugin will use defaults.

### Optional configuration
`path` - Metalsmith metadata key to finding your page relative path. It is used to generate absolute URL to the page, using `path` and `siteurl`. If you are using `metalsmith-permalinks` plugin you could leave it as default value -- 'path', this plugin adds `path` property to your content. Otherwise, you may pass own front matter key to the configuration:

```js
Metalsmith(__dirname)
  ...
  .use(disqus({
    siteurl: 'my-site.com',
    shortname: 'my-site',
    path: 'alias' // Used `alias` property to find page path.
  }));
```

`path` - Metalsmith metadata key to finding your page title that will be used in comments widget configuration. Default value -- 'title'. You may pass own front matter key to the configuration:

```js
Metalsmith(__dirname)
  ...
  .use(disqus({
    siteurl: 'my-site.com',
    shortname: 'my-site',
    title: 'label' // Used `label` property to find page title.
  }));
```

`identifier` - Metalsmith metadata key to finding your page property from which plugin will generate the unique value. This value will be used in Disqus to define content page unique id. It will help Disqus to add the same commenting widget to all content instances, that may have few aliases, for example, the page may be available by few URLs or under different network protocols. Default value -- 'title', `metalsmith-disqus` will take the content title and sluglify it. You may pass own front matter key to the configuration:

```js
Metalsmith(__dirname)
  ...
  .use(disqus({
    siteurl: 'my-site.com',
    shortname: 'my-site',
    identifier: 'uuid' // Used `uuid` property to generate unique id.
  }));
```

`counterSelector` - a string that represents CSS class name selector for counter widget container. By default plugin is lookin for `.disqus-comment-count` elements in markup. Then it will add Disqus identifiers to HTML elements, so disqus widget will know what comments amount to insert inside which of them. Now only selectors starting with class name definition works.

### Widgets insertion

There are two widgets possible to use from Disqus -- the commenting widget and comments counter. To use comments widgets just add `comments: true` to content front matter data:

```yaml
---
title: Hello World
comments: true
---
```

But wouldn't be enought, you need to add HTML container for Disqus comments inside your page template with id `disqus_thread`, if you're using handlebars as templateengine it may look like this:

```html
{{#if comments }}
<!-- Comments widget will be rendered in this element -->
<section id="disqus_thread"></section>
{{/if}}
```

The same manipulations needed for comments count widget, just enable `comments-counter: true` in metadata and add a container to insert text with some comments. The difference is that for the container you should use the class name `disqus-comment-count` (configured by default) or specify any CSS class with `counterSelector` option. Also, you need to render property to that is used as `identifier` in your settings (`title` by default) inside `data-disqus-key` attribute. This data-attribute in necessary to insert correct counter to proper content:

```yaml
---
title: My page
comments-counter: true
---
```

```html
{{#if comments }}
<!-- Comments counter will be rendered in this element -->
<span class="disqus-comment-count" data-disqus-key="{{title}}"></span>
{{/if}}
```

### Performance optimizations
As a bonus, the plugin can prefetch Disqus DNS and preload scripts by simple parameters in YAML front matter. Adding `disqus-dns-prefetch: true` will add line tag that will tell the browser to start resolving disqus hosts earlier to decrease library loading time. Other parameters: `disqus-prefetch-widget: true` and `disqus-prefetch-counter: true` will force modern browsers to start loading scripts before they are requested by the user.

Let's imagine real project situation when you have a page(s) with listings of content that have comments, and if you add `disqus-prefetch-widget: true` to this pages, while user is discovering this content, modern browsers could load commenting widget script. Then after the transition to the content page, widget JavaScript will be already in place. You can check this feature support [here](http://caniuse.com/#feat=link-rel-prefetch). It is cost nothing to add it, and it will not affect unsupported browsers.

## Let's keep in touch
If you have any issues or any ideas regarding new features, please leave them [here](https://github.com/vitaliy-bobrov/metalsmith-disqus/issues).
