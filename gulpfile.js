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
const pkg              = require('./package.json');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Lint JavaScript
gulp.task('lint', () => gulp.src(['js/**/*.js','!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
);

gulp.task('webp', () => gulp.src('./src/images/**/*.{jpg,jpeg,png,gif}')
  .pipe($.cache($.webp()))
  .pipe(gulp.dest('build/images'))
);

// Optimize images
gulp.task('images', () => gulp.src('./src/images/**/*.{jpg,jpeg,png,gif}')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('build/images'))
    .pipe($.size({title: 'images'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const processors = [
    assets({
      basePath: './',
      baseUrl: '../',
      loadPaths: ['images/'],
      cachebuster: true
    }),
    autoprefixer,
    mqpacker({sort: true}),
    mqkeyframes
  ];

  return gulp.src('scss/**/*.scss')
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: ['./node_modules/material-design-lite/src/'],
      outputStyle: 'expanded',
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.webpcss())
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano({
      convertValues: false,
      autoprefixer: false
    })))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('build/css'))
    .pipe(gulp.dest('.tmp/styles'));
});

// Concatenate and minify JavaScript.
gulp.task('scripts', () =>
    gulp.src([
      './js/main.js',
      './node_modules/material-design-lite/dist/material.js'
    ])
      .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({preserveComments: 'some'}))
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('build/js'))
      .pipe(gulp.dest('.tmp/scripts'))
);

// Clean output directory
gulp.task('clean', () => del([
  '.tmp',
  'build/images',
  'build/js',
  'build/css'
  ], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['scripts', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', './'],
    port: 3000
  });

  gulp.watch(['scss/**/*.scss'], ['styles', reload]);
  gulp.watch(['js/**/*.js'], ['lint', 'scripts', reload]);
  gulp.watch(['images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'build',
    port: 3001
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    ['lint', 'scripts', 'webp', 'images']
  )
);
