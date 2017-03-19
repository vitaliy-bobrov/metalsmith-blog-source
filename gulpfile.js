'use strict';

const path             = require('path');
const gulp             = require('gulp');
const del              = require('del');
const runSequence      = require('run-sequence');
const browserSync      = require('browser-sync');
const gulpLoadPlugins  = require('gulp-load-plugins');
const assets           = require('postcss-assets');
const autoprefixer     = require('autoprefixer');
const mqpacker         = require('css-mqpacker');
const mqkeyframes      = require('postcss-mq-keyframes');
const exec             = require('child_process').exec;
const request          = require('request');
const url              = require('url');
const swPrecache       = require('sw-precache');
const pkg              = require('./package.json');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const onError = function(error) {
  console.log(error.toString());
  this.emit('end');
};

const UGLIFY_CONFIG = {
  output: {
    comments: false
  }
};

const LOCAL_PORT = 3000;
const PROD_URL = 'https://vitaliy-bobrov.github.io/';
const SITEMAP_URL = url.resolve(PROD_URL, 'sitemap.xml');

gulp.task('metalsmith', ['svg'], callback => exec(`node ./metalsmith.js --url=${PROD_URL}`,
  (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  }));

gulp.task('service-files', () => gulp.src([
  'service-files/**/*',
  '!service-files/.updated.json'
])
  .pipe(gulp.dest('build')));

// Lint JavaScript
gulp.task('lint', () => gulp.src([
    'js/**/*.js',
    '!node_modules/**'
  ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
);

gulp.task('webp', () => gulp.src([
    'images/**/*.{jpg,jpeg,png,gif}',
    '!./images/posts/**/img/*.jpg',
    '!images/icons/**.*',
    '!images/**/*-og.jpg'
  ])
  .pipe($.webp())
  .pipe(gulp.dest('images'))
);

// Optimize images
gulp.task('images', ['webp'], () => gulp.src('./images/**/*.{jpg,jpeg,png,gif,webp}')
    .pipe(gulp.dest('build/images'))
    .pipe($.size({title: 'images'}))
);

gulp.task('svg', () => gulp.src('images/svg/*.svg')
  .pipe($.plumber({
    errorHandler: onError
  }))
  .pipe($.svgSprite({
    mode: {
      defs: {
        dest: './',
        sprite: '../images/sprites/sprite.svg',
        inline: true,
        example: {
          template: './images/sprites/template.html',
          dest: 'sprite.html'
        }
      }
    }
  }))
  .pipe(gulp.dest('partials'))
  .pipe($.size({title: 'svg'})));

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const processors = [
    assets({
      basePath: './',
      baseUrl: '../',
      loadPaths: ['images/']
    }),
    autoprefixer,
    mqpacker({sort: true}),
    mqkeyframes
  ];

  const prod = process.env.NODE_ENV === 'production';

  return gulp.src('scss/**/*.scss')
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: [
        'node_modules/material-design-lite/src/',
        'node_modules/mdl-ext/src'
      ],
      outputStyle: 'expanded',
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.webpcss())
    .pipe($.if(prod, $.uncss({
      html: ['build/**/*.html'],
      ignore: [
        /^\.js-.*/,
        /.*-js-.*/,
        /^.*is-.*/,
        /^.*mdl-(layout|menu|button|button--fab|snackbar|ripple).*/,
        /^.*\.webp.*/,
        /^\.to-top.*/,
        '.drawer-icon'
      ]
    })))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('build/css'));
});

// Concatenate and minify JavaScript.
gulp.task('scripts', () =>
    gulp.src([
      'node_modules/material-design-lite/src/mdlComponentHandler.js',
      'node_modules/material-design-lite/src/button/button.js',
      'node_modules/material-design-lite/src/icon-toggle/icon-toggle.js',
      'node_modules/material-design-lite/src/menu/menu.js',
      'node_modules/material-design-lite/src/layout/layout.js',
      'node_modules/material-design-lite/src/ripple/ripple.js',
      'node_modules/material-design-lite/src/snackbar/snackbar.js',
      'js/*.js'
    ])
      .pipe($.plumber({
        errorHandler: onError
      }))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe($.concat('main.min.js'))
      .pipe($.uglify(UGLIFY_CONFIG))
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('build/js')));

// Clean output directory
gulp.task('clean', () => del([
  'build/images',
  'build/js',
  'build/css'
  ], {dot: true}));

// Watch files for changes & reload
gulp.task('serve:dev', () => {
  browserSync({
    notify: false,
    logPrefix: 'MetalSync',
    scrollElementMapping: ['main', '.mdl-layout'],
    server: ['build'],
    port: LOCAL_PORT
  });

  gulp.watch([
      'layouts/**/*.html',
      'partials/**/*.html',
      'images/**/*.svg',
      'source/**/*.md'
    ], ['metalsmith', reload]);
  gulp.watch(['scss/**/*.scss'], ['styles', reload]);
  gulp.watch(['js/**/*.js'], ['lint', 'scripts', reload]);
  gulp.watch(['images/**/*'], reload);
});

gulp.task('html', () => gulp.src('build/**/*.html')
  .pipe($.htmlmin({
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    quoteCharacter: '"',
    removeComments: true
  }))
  .pipe(gulp.dest('build')));

gulp.task('deploy', ['html', 'styles', 'minify-sw'], () => {
  let date = new Date();
  let formattedDate = date.toUTCString();

  return gulp.src('build/**/*')
    .pipe($.ghPages({
      remoteUrl: 'git@github.com:vitaliy-bobrov/vitaliy-bobrov.github.io.git',
      branch: 'master',
      message: `Updates blog content ${formattedDate}`
    }));
});

gulp.task('seo', cb => {
  request(`http://www.google.com/webmasters/tools/ping?sitemap=${SITEMAP_URL}`);
  request(`http://www.bing.com/webmaster/ping.aspx?siteMap=${SITEMAP_URL}`);
  cb();
});

gulp.task('assets', ['clean'], cb => runSequence(
    'styles',
    ['scripts', 'images', 'service-files'],
    cb
  )
);

gulp.task('tunel', ['assets'], cb => runSequence(
    'serve:tunel',
    'tunel:start',
    'metalsmith',
    cb
  )
);

gulp.task('copy-sw-scripts', () => gulp.src([
    'node_modules/sw-toolbox/sw-toolbox.js',
    'node_modules/sw-offline-google-analytics/build/offline-google-analytics-import.min.js',
    'js/sw/*.js'
  ])
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe(gulp.dest('build/js/sw')));

gulp.task('generate-service-worker', ['copy-sw-scripts'], () => {
  const rootDir = 'build';
  const filepath = path.join(rootDir, 'service-worker.js');
  const ONE_YEAR_IN_SEC = 31557600;
  const ONE_WEEK_IN_SEC = 604800;

  return swPrecache.write(filepath, {
    cacheId: pkg.name,
    importScripts: [
      'js/sw/sw-toolbox.js',
      'js/sw/offline-google-analytics-import.min.js',
      'js/sw/offline-analytics.js',
      'js/sw/runtime-caching.js'
    ],
    staticFileGlobs: [
      `${rootDir}/images/icons/`,
      `${rootDir}/images/authors/`,
      `${rootDir}/images/!(*-og.jpg)`,
      `${rootDir}/js/**/*.js`,
      `${rootDir}/css/**/*.css`,
      `${rootDir}/*.{json,ico}`,
      `${rootDir}/about/*.html`
    ],
    runtimeCaching: [
      {
        urlPattern: /.*\.(png|jpg|gif|webp|svg)/i,
        handler: 'cacheFirst',
        options: {
          cache: {
            name: 'images-cache',
            maxEntries: 100,
            maxAgeSeconds: ONE_YEAR_IN_SEC
          }
        }
      },
      {
        urlPattern: /\/blog\/.*\.html/,
        handler: 'networkFirst',
        options: {
          cache: {
            name: 'posts-cache',
            maxEntries: 24,
            maxAgeSeconds: ONE_YEAR_IN_SEC
          }
        }
      },
      {
        urlPattern: /\/.*\.html/,
        handler: 'networkFirst',
        options: {
          cache: {
            name: 'blog-list-cache',
            maxEntries: 24,
            maxAgeSeconds:  ONE_WEEK_IN_SEC
          }
        }
      },
      {
        urlPattern: /\/(category|page)\/.*\.htmll/,
        handler: 'networkFirst',
        options: {
          cache: {
            name: 'category-cache',
            maxEntries: 72,
            maxAgeSeconds:  ONE_WEEK_IN_SEC
          }
        }
      }
    ],
    stripPrefix: rootDir + '/'
  });
});

gulp.task('minify-sw', () => {
  gulp.src('build/service-worker.js')
    .pipe($.uglify(UGLIFY_CONFIG))
    .pipe(gulp.dest('build'));
});

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    ['metalsmith', 'lint', 'scripts', 'images', 'service-files'],
    'generate-service-worker',
    cb
  )
);
