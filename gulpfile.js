'use strict';

const path             = require('path');
const gulp             = require('gulp');
const del              = require('del');
const runSequence      = require('run-sequence');
const browserSync      = require('browser-sync');
const gulpLoadPlugins  = require('gulp-load-plugins');
const imageminMozjpeg  = require('imagemin-mozjpeg');
const imageminWebp     = require('imagemin-webp');
const assets           = require('postcss-assets');
const autoprefixer     = require('autoprefixer');
const mqpacker         = require('css-mqpacker');
const mqkeyframes      = require('postcss-mq-keyframes');
const exec             = require('child_process').exec;
const pkg              = require('./package.json');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const onError = function(error) {
  console.log(error.toString());
  this.emit('end');
};

gulp.task('metalsmith', ['svg'], callback => exec('node ./metalsmith.js',
  (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  }));

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
    '!images/icons/**.*'
  ])
  .pipe($.cache($.webp()))
  .pipe(gulp.dest('images'))
);

// Optimize images
gulp.task('images', ['webp'], () => gulp.src('images/**/*.{jpg,jpeg,png,gif,webp}')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      use: [
        imageminMozjpeg(),
        imageminWebp()
      ]
    })))
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
      loadPaths: ['images/'],
      cachebuster: true
    }),
    autoprefixer,
    mqpacker({sort: true}),
    mqkeyframes
  ];

  return gulp.src('scss/**/*.scss')
    .pipe($.newer('.tmp/styles'))
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
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('build/css'))
    .pipe(gulp.dest('.tmp/styles'));
});

// Concatenate and minify JavaScript.
gulp.task('scripts', () =>
    gulp.src([
      'js/*.js',
      'node_modules/material-design-lite/dist/material.js'
    ])
      .pipe($.newer('.tmp/scripts'))
      .pipe($.plumber({
        errorHandler: onError
      }))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('main.min.js'))
      .pipe($.uglify())
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
    server: ['.tmp', 'build'],
    port: 3000
  });

  gulp.watch(['layouts/**/*.html', 'partials/**/*.html', 'images/**/*.svg'], ['metalsmith', reload]);
  gulp.watch(['scss/**/*.scss'], ['styles', reload]);
  gulp.watch(['js/**/*.js'], ['lint', 'scripts', reload]);
  gulp.watch(['images/**/*'], reload);
});

gulp.task('deploy', () => gulp.src('build/**/*')
  .pipe($.ghPages({
    remoteUrl: 'git@github.com:vitaliy-bobrov/vitaliy-bobrov.github.io.git',
    branch: 'master',
    message: 'Updates blog content [timestamp]'
  })));

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    ['metalsmith', 'lint', 'scripts', 'images']
  )
);
