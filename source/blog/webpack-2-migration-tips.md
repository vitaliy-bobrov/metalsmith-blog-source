---
title: Webpack 2 Migration Tips
description: Webpack 2 has been just released, it brings a lot of improvement and cool features, as well as breaking changes in configuration.
ogimage: images/posts/webpack-2-migration-tips/webpack-2-migration-tips-og.jpg
tumb: /images/posts/webpack-2-migration-tips/webpack-2-migration-tips
created: 2017-02-09
categories:
- Guides
- Tools
---
Webpack 2 has been just released, it brings a lot of improvement and cool features, as well as breaking changes in configuration. Not all issues are easy to find by googling, to solve it fast. That is why I want to share tips that might help you to update you Webpack configuration and don't break your bundle.

First of all, you need to check all new and more user-friendly [documentation](https://webpack.js.org/configuration/). It is not full now, but anyway, this is the official guide and will be handy.

## Remove deprecated custom webpack options
So let's start, the first issue that will break your build -- exception related to custom properties in your config object. Now properties are limited to allowed list and checked by Webpack. Not all "loaders" allow configuration with new `options` parameter, for such Webpack loaders you should use `LoaderOptionsPlugin` until they are up-to-date with new rules. From my experience, this was related to `sass` loader. Here is the example:

```js
const path = require('path');

...
plugins: [
  new webpack.LoaderOptionsPlugin({
    sassLoader: {
      includePaths: [path.resolve(__dirname, "./mdl")],
      precision: 10
    },
    context: __dirname
  })
]
```

You might mention that I've also added context option, it is not a mistake. This was necessary to pass context to got sass non-relative imports like `@import '~mdl/component'` working.

## Configure Babel
If you are using Babel to transpile your code to ES5, there is a good news for you, from the 2nd version Webpack supports native imports. So you don't need to transform such statements as `import moment from 'moment'` to CommonJS modules, Webpack normally handles this. To configure Babel properly just add option to preset `es2015` in your `.babelrc` file:

```json
"presets": [
  ["es2015", { "modules": false }]
]
```

That will enable usual `preset-es2015` with the disabled native module to CommonJS transform.

## Rename configuration properties
In new Webpack, some of the properties were renamed. You should rename your `module.loaders` to `module.rules` and inside each rule change `loader` property to `use` array, like this:

```js
...
module: {
  rules: [
    {
      test: /\.ts$/,
      use: [
        'typescript-loader'
      ]
    }
  ]
```

## Change ugly loaders chain
From now old-style short syntax for loaders definition is deprecated, you should use an array of strings/objects instead. Also, automatic loader resolve is disabled by default, prefer to write full loader name. Example of transformed loader `style!css?sourceMap!postcss!sass?sourceMap`:

```js
module: {
  rules: [
    {
      test: /\.(scss|sass)$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        },
        {
          loader: 'postcss-loader'
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }
      ]
    }
  ]
}
```

Here you can also mention that if loader has no options, it could be declared as a simple string instead object with `loader` key.

## Extract Text Plugin
When this post was written `ExtractTextPlugin` hasn't stable release for Webpack 2, that is why you need to specify the latest version of the v2 branch while installation `npm install extract-text-webpack-plugin@2.0.0-beta.5`. Also in my configuration it won't get to work with CSS preprocessor, the solution was to change config:

```js
module: {
  rules: [
    {
      test: /\.(scss|sass)$/,
      use: [
        ExtractTextPlugin.extract('style-loader'),
        {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        },
        'postcss-loader'
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }
      ]
    }
  ]
},
plugins: [
  new ExtractTextPlugin('styles.css')
]
```

That was the typical issues I've faced while upgrading my projects build, and you can find out more in official documentation. Hope my tips will save your time and reduce a headache before docs are entirely fulfilled. Write your tip in comments.
