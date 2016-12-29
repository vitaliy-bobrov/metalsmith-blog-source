const Metalsmith       = require('metalsmith');
const updated          = require('metalsmith-updated');
const changed          = require('metalsmith-changed');
const drafts           = require('metalsmith-drafts');
const collections      = require('metalsmith-collections');
const pagination       = require('metalsmith-pagination');
const author           = require('metalsmith-author');
const registerHelpers  = require('metalsmith-register-helpers');
const headings         = require('metalsmith-headings');
const layouts          = require('metalsmith-layouts');
const markdown         = require('metalsmith-markdown');
const highlight        = require('metalsmith-code-highlight');
const permalinks       = require('metalsmith-permalinks');
const excerptor        = require('metalsmith-excerptor');
const openGraph        = require('metalsmith-open-graph');
const sitemap          = require('metalsmith-mapsite');
const debug            = require('metalsmith-debug');
const disqus           = require('metalsmith-disqus');

// Site Variables.
const sitename = 'Bobrov Blog';
const siteurl = 'https://vitaliy-bobrov.github.io/';

Metalsmith(__dirname)
  .metadata({
    sitename,
    siteurl,
    sitelogo: '/images/logo',
    description: 'Блог о программировании и не только...',
    themeColor: '#00bcd4',
    generatorname: 'Metalsmith',
    generatorurl: 'http://metalsmith.io/'
  })
  .source('./source')
  .destination('./build')
  .clean(false)
  // .use(debug())
  // .use(changed({
  //   forcePattern: [
  //     '**/index.md'
  //   ]
  // }))
  .use(updated())
  .use(drafts())
  .use(collections({
    pages: {
      pattern: 'pages/*.md'
    },
    posts: {
      pattern: 'blog/*.md',
      sortBy: 'created',
      reverse: true
    }
  }))
  .use(author({
    collection: 'posts',
    authors: {
      me: {
        name: 'Vitaliy Bobrov',
        url: siteurl,
        github: 'https://github.com/vitaliy-bobrov',
        twitter: 'https://twitter.com/bobrov1989',
        linkedin: 'https://www.linkedin.com/in/vitaliybobrov'
      }
    }
  }))
  .use(pagination({
    'collections.posts': {
      perPage: 8,
      layout: 'blog.html',
      first: 'index.html',
      noPageOne: true,
      path: 'blog/page/:num/index.html',
      pageMetadata: {}
    }
  }))
  .use(headings('h2'))
  .use(markdown())
  .use(highlight({
    tabReplace: '  ',
    classPrefix: '',
    languages: ['js', 'html', 'css']
  }))
  .use(permalinks({
    relative: false
  }))
  .use(excerptor({
    maxLength: 400,
    keepImageTag: false,
    ellipsis: '…'
  }))
  .use(registerHelpers({
    directory: './helpers'
  }))
  .use(layouts({
    engine: 'handlebars',
    default: 'post.html',
    partials: './partials'
  }))
  .use(disqus({
    siteurl,
    shortname: 'bobrov-blog'
  }))
  .use(openGraph({
    sitename,
    siteurl,
    title: 'ogtitle',
    description: 'ogdescr',
    image: 'ogimage',
    decodeEntities: false
  }))
  .use(sitemap({
    hostname: siteurl
  }))
  .build(function(err) {
    if (err) {
    console.error(err);
    } else {
      console.log('Metalsmith build completed')
    }
  });
