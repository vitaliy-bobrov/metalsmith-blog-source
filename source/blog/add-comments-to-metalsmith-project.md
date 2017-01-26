---
title: Add Comments to Your Metalsmith Project
description:
ogimage: images/posts/add-comments-to-metalsmith-project/add-comments-to-metalsmith-project-og.jpg
tumb: /images/posts/add-comments-to-metalsmith-project/add-comments-to-metalsmith-project
categories:
- Metalsmith
- Projects
---
Comments are the important part of communication with audience. It fits for a lot type of websites starting from blogs finishing with e-commerce. Metalsmith is a static site generator, that means (in most cases) that developer won't to have database and other back-end infrastructure to implement commenting functionality. But it not means that you can't add it.

There are services that provide commenting widgets as a service in web. The most widely-user and popular of them -- [Disqus](https://disqus.com/). With it you will not care about a lot of complicated things related to comments. So what they offer to you:
- Commenting widget
- Real-time comments updates
- Comments counter widget
- Spam filtering
- Moderation tool
- Design adapting to your website
- Media resources support

## Register your site

## Integrate with Metalsmith
Metalsmith was created as flexible as possible, it has a tiny core functionaly. Any additional feature could be implemented by plugin. So to simplify Disqus integration I created [plugin](https://github.com/vitaliy-bobrov/metalsmith-disqus) -- `metalsmith-disqus`.

[Star on GitHub](https://github.com/vitaliy-bobrov/metalsmith-disqus)
{star-me}

### Installation
The instalation process is pretty simple, just run command in your terminal:

```bash
npm install --save-dev metalsmith-disqus
```
### Plug into Metalsmith build
Plugin needs HTML markup to be already generated for its work, because it will look for elements with configured class names and add Disqus scprits, metatags to your page. So you need to place it after markdown files are processed, for exaple after `metalsmith-layouts` plugin:

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
You need to specify 2 required configuration options -- `siteurl` and `shortname`. `siteurl` -- needed to generate absolute url for your pages. This is required for proper Disqus widget configuration. `shortname` is the same name that you received while website registration in Disqus admin. Disqus gives the links to widgets based on your shortname sub-domain. All other options are optional, if not specified plugin will use defaults.

### Optional configuration
`path` - Metalsmith metadata key to find your page relative path. It is used to generate absolute url to the page, using `path` and `siteurl`. If you using `metalsmith-permalinks` plugin you could leave it as default value -- 'path', this plugin adds `path` property to your content. Otherwise you may pass own front matter key to configuration:

```js
Metalsmith(__dirname)
  ...
  .use(disqus({
    siteurl: 'my-site.com',
    shortname: 'my-site',
    path: 'alias' // Used `alias` property to find page path.
  }));
```

`path` - Metalsmith metadata key to find your page title that will be used in comments widget configuration. Default value -- 'title'. You may pass own front matter key to configuration:

```js
Metalsmith(__dirname)
  ...
  .use(disqus({
    siteurl: 'my-site.com',
    shortname: 'my-site',
    title: 'label' // Used `label` property to find page title.
  }));
```

`identifier` - Metalsmith metadata key to find your page property from which plugin will generate unique value. This value will be used in Disqus to define content page unique id. It will help Disqus to add same commenting widget to all content instances, that may have few aliases, for exapmle, page may be available by few urls or under different network protocols. Default value -- 'title', `metalsmith-disqus` will take content title and sluglify it. You may pass own front matter key to configuration:

```js
Metalsmith(__dirname)
  ...
  .use(disqus({
    siteurl: 'my-site.com',
    shortname: 'my-site',
    identifier: 'uuid' // Used `uuid` property to generate unique id.
  }));
```

`counterSelector` - string that represent CSS class name selector for counter widget container. By default plugin looks for `.disqus-comment-count` elements in markup. Then it will add Disqus identifiers to HTML elements, so disqus widget will know what comments amout to insert inside which of them. Now only selectors starting with class name definition works.

If you have aby issues or any ideas regarding new features, please leave them [here](https://github.com/vitaliy-bobrov/metalsmith-disqus/issues).
