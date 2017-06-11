const Metalsmith = require('metalsmith');
const pkg = require('./package.json');
const loadPlugins = require('./load-plugins');

const extlink = require('remarkable-extlink');
const classy = require('remarkable-classy');
const emoji = require('remarkable-emoji');

const $ = loadPlugins(pkg, 'devDependencies', 'metalsmith-');

// Site Variables.
const siteurl = 'https://vitaliy-bobrov.github.io/';
const sitename = 'Bobrov Blog';
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
    rss: `${siteurl}rss.xml`,
    facebookAppId,
    gaId,
    sitelogo: '/images/logo',
    siteogimg: 'images/blog-og.jpg',
    description: siteDescr,
    themeColor: '#00bcd4',
    generatorname: 'Metalsmith',
    generatorurl: 'http://metalsmith.io/'
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
      }
    },
    {
      pattern: postsPattern,
      defaults: {
        draft: false,
        author: 'me',
        comments: true,
        twitter: true
      }
    }
  ]))
  .use($.drafts())
  .use($.discoverPartials({
    directory: 'partials',
    pattern: /\.html$/
  }))
  .use($.collections({
    pages: {
      pattern: pagesPattern
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
        name: 'Vitaliy Bobrov',
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
    .use(emoji)
  )
  .use($.codeHighlight({
    tabReplace: '  ',
    languages: [
      'js',
      'ts',
      'html',
      'css',
      'bash',
      'json',
      'yaml'
    ]
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
    hostname: siteurl
  }))
  .use($.feed({
    collection: 'posts',
    postDescription: file => file.description,
    site_url: siteurl,
    title: sitename,
    description: siteDescr
  }))
  .build(function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('Metalsmith build completed');
    }
  });
