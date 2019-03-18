const Metalsmith = require('metalsmith');
const pkg = require('./package.json');
const loadPlugins = require('./load-plugins');

const extlink = require('remarkable-extlink');
const classy = require('remarkable-classy');
const emoji = require('remarkable-emoji');
const youtube = require('remarkable-youtube');

const $ = loadPlugins(pkg, 'devDependencies', 'metalsmith-');

const prod = process.env.NODE_ENV === 'production';

// Site Variables.
const siteurl = prod ? 'https://bobrov.dev/' : 'http://localhost:3000/';
const sitename = 'Bobrov Dev';
const siteDescr = 'Blog about web development, but not only...';
const facebookAppId = 393821434298248;
const gaId = 'UA-90372372-1';

// Content variables.
const pagesPattern = 'pages/*.md';
const postsPattern = 'blog/**/*.md';
const postsSortBy = 'created';
const postsPerPage = 8;

Metalsmith(__dirname)
  .metadata({
    locale: 'en',
    sitename,
    siteurl,
    facebookAppId,
    gaId,
    sitelogo: '/images/logo',
    siteogimg: 'images/blog-og.jpg',
    description: siteDescr,
    themeColor: '#008ba3'
  })
  .source('./source')
  .destination('./build')
  .clean(false)
  .use($.updated({
    updatedFile: '../service-files/.updated.json'
  }))
  .use($.defaultValues([
    {
      pattern: pagesPattern,
      defaults: {
        layout: 'page.html',
        changefreq: 'weekly',
        priority: 0.9
      }
    },
    {
      pattern: postsPattern,
      defaults: {
        draft: false,
        author: 'me',
        comments: true,
        twitter: true,
        changefreq: 'monthly',
        priority: 1.0
      }
    }
  ]))
  .use($.drafts())
  .use($.discoverPartials({
    directory: './partials',
    pattern: /\.html$/
  }))
  .use($.collections({
    pages: {
      pattern: pagesPattern,
      sortBy: 'priority',
      reverse: true
    },
    posts: {
      pattern: postsPattern,
      sortBy: postsSortBy,
      reverse: true
    }
  }))
  .use($.author({
    collection: 'posts',
    authors: {
      me: {
        name: 'Vitalii Bobrov',
        url: siteurl,
        avatar: '/images/authors/bobrov/avatar',
        github: 'https://github.com/vitaliy-bobrov',
        twitter: 'https://twitter.com/bobrov1989',
        linkedin: 'https://www.linkedin.com/in/vitaliybobrov',
        facebook: 'https://www.facebook.com/bobrov1989'
      }
    }
  }))
  .use($.pagination({
    'collections.posts': {
      perPage: postsPerPage,
      layout: 'blog.html',
      first: 'index.html',
      noPageOne: true,
      path: 'blog/page/:num/index.html',
      pageMetadata: {
        title: sitename,
        description: siteDescr,
        'comments-counter': true,
        'disqus-prefetch-widget': true,
        changefreq: 'always',
        priority: 1.0,
        twitter: true
      }
    }
  }))
  .use($.markdownRemarkable({
    typographer: true
  })
    .use(classy)
    .use(extlink, {
      host: siteurl
    })
    .use(youtube, {
      className: 'js-lazy-load',
      origin: siteurl,
      related: false,
      attr: 'data-src'
    })
    .use(emoji)
  )
  .use($.prism({
    preLoad: ['bash', 'css-extras', 'json', 'python', 'scss', 'typescript']
  }))
  .use($.permalinks({
    relative: false,
    linksets: [
      {
        match: {
          collection: 'pages'
        },
        pattern: ':title'
      }
    ]
  }))
  .use($.excerpts())
  .use($.tags({
    handle: 'categories',
    path: 'category/:tag/index.html',
    pathPage: 'category/:tag/:num/index.html',
    perPage: postsPerPage,
    layout: '../layouts/category.html',
    sortBy: 'created',
    reverse: true,
  }))
  .use($.registerHelpers({
    directory: './helpers'
  }))
  .use($.layouts({
    engine: 'handlebars',
    default: 'post.html'
  }))
  .use($.disqus({
    siteurl,
    shortname: 'bobrov-blog'
  }))
  .use($.twitterCard({
    siteurl,
    card: 'summary_large_image',
    site: '@bobrov1989',
    title: 'title',
    description: 'description',
    image: 'ogimage',
    'image:alt': 'title'
  }))
  .use($.mapsite({
    hostname: siteurl,
    omitIndex: true
  }))
  .build(function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('Metalsmith build completed');
    }
  });
