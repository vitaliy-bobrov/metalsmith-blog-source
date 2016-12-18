const Metalsmith    = require('metalsmith');
const changed       = require('metalsmith-changed');
const drafts        = require('metalsmith-drafts');
const collections   = require('metalsmith-collections');
const author        = require('metalsmith-author');
const layouts       = require('metalsmith-layouts');
const markdown      = require('metalsmith-markdown');
const permalinks    = require('metalsmith-permalinks');

Metalsmith(__dirname)
  .metadata({
    sitename: 'Bobrov Blog',
    siteurl: 'https://vitaliy-bobrov.github.io/',
    description: 'Blog about programming, but not only...',
    themeColor: '#0d47a1',
    generatorname: 'Metalsmith',
    generatorurl: 'http://metalsmith.io/'
  })
  .source('./source')
  .destination('./build')
  .clean(false)
  .use(changed({
    forcePattern: [
      '**/index.md'
    ]
  }))
  .use(drafts())
  .use(collections({
    posts: 'posts/*.md'
  }))
  .use(author({
    collection: 'posts',
    authors: {
      me: {
        name: 'Vitaliy Bobrov',
        url: 'https://vitaliy-bobrov.github.io',
        github: 'https://github.com/vitaliy-bobrov',
        twitter: '@bobrov1989',
        linkedin: 'https://www.linkedin.com/in/vitaliybobrov'
      }
    }
  }))
  .use(markdown())
  .use(permalinks())
  .use(layouts({
    engine: 'handlebars',
    default: 'post.html',
    partials: './partials'
  }))
  .build(function(err) {
    if (err) {
    console.error(err);
    } else {
      console.log('Build completed!')
    }
  });
