'use strict';

const path = require('path');
const gulp = require('gulp');
const del = require('del');
const once = require('async-once');
const browserSync = require('browser-sync');
const gulpLoadPlugins = require('gulp-load-plugins');
const assets = require('postcss-assets');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const mqkeyframes = require('postcss-mq-keyframes');
const exec = require('child_process').exec;
const request = require('request');
const url = require('url');
const workboxBuild = require('workbox-build');
const pkg = require('./package.json');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const onError = function(error) {
  console.log(error.toString());
  this.emit('end');
};

const prod = process.env.NODE_ENV === 'production';
const LOCAL_PORT = 3000;
const PROD_URL = 'https://vitaliy-bobrov.github.io/';
const SITEMAP_URL = url.resolve(PROD_URL, 'sitemap.xml');
const BABELRC = {
  presets: [
    prod &&
    [
      '@babel/preset-env',
      {
        loose: true
      }
    ]
  ]
  .filter(Boolean),
  shouldPrintComment: () => !prod
};

const svg = () => gulp.src('images/svg/*.svg')
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
  .pipe($.size({title: 'svg'}));

gulp.task('svg', svg);

const metalsmith = gulp.series(
  'svg',
  done => exec(
    `node ./metalsmith.js --url=${PROD_URL}`,
    (err, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      done(err);
    }
  )
);

gulp.task('metalsmith', metalsmith);

const serviceFiles = () => gulp.src([
    'service-files/**/*',
    '!service-files/.updated.json'
  ])
  .pipe(gulp.dest('build'));

gulp.task('service-files', serviceFiles);

const lint = () => gulp.src([
    'js/**/*.js',
    '!node_modules/**'
  ])
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.if(!browserSync.active, $.eslint.failAfterError()));

gulp.task('lint', lint);

const webp = () => gulp.src([
    'images/**/*.{jpg,jpeg,png,gif}',
    '!./images/posts/**/img/*.jpg',
    '!images/icons/**.*',
    '!images/**/*-og.jpg',
    '!images/bg-*.jpg'
  ])
  .pipe($.webp({
    quality: 100,
    method: prod ? 6 : 0
  }))
  .pipe(gulp.dest('images'));

gulp.task('webp', webp);

const images = gulp.series(
  'webp',
  () => gulp.src('./images/**/*.{jpg,jpeg,png,gif,webp}')
    .pipe(gulp.dest('build/images'))
    .pipe($.size({title: 'images'}))
);

gulp.task('images', images);

const styles = () => {
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

  return gulp.src('scss/**/*.scss')
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe($.if(!prod, $.sourcemaps.init()))
    .pipe($.sass({
      includePaths: [
        'node_modules/material-design-lite/src/',
        'node_modules/mdl-ext/src'
      ],
      outputStyle: 'expanded',
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.if(prod, $.uncss({
      html: ['build/**/*.html'],
      ignore: [
        /^.*is-(compact|small-screen|visible|active|animating|upgraded).*/,
        /^.*to-top.*/,
        /^.*mdl-(menu|button|button--fab|snackbar).*/,
        /^.*ripple-ink_animate.*/
      ]
    })))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.if(!prod, $.sourcemaps.write('./')))
    .pipe(gulp.dest('build/css'));
};

gulp.task('styles', styles);

const scripts = () => gulp.src([
    'node_modules/material-design-lite/src/mdlComponentHandler.js',
    'node_modules/material-design-lite/src/menu/menu.js',
    'node_modules/material-design-lite/src/snackbar/snackbar.js',
    'js/*.js'
  ])
  .pipe($.plumber({
    errorHandler: onError
  }))
  .pipe($.if(!prod, $.sourcemaps.init()))
  .pipe($.babel(BABELRC))
  .pipe($.concat('main.min.js'))
  .pipe($.if(prod, $.babelMinify()))
  .pipe($.size({title: 'scripts'}))
  .pipe($.if(!prod, $.sourcemaps.write('./')))
  .pipe(gulp.dest('build/js'));

gulp.task('scripts', scripts);

const paint = () => gulp.src(['js/paint/*.js'])
  .pipe($.plumber({
    errorHandler: onError
  }))
  .pipe($.if(prod, $.babelMinify()))
  .pipe(gulp.dest('build/js'));

gulp.task('paint', paint);

const clean = once((done) => {
  del([
    'build/images',
    'build/js',
    'build/css'
  ], {dot: true}).then(() => done());
});

gulp.task('clean', clean);

const serve = () => {
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
    ], gulp.series('metalsmith', reload));
  gulp.watch(['scss/**/*.scss'], gulp.series('styles', reload));
  gulp.watch(['js/**/*.js'], gulp.series('lint', 'scripts', 'paint', reload));
  gulp.watch(['images/**/*'], reload);
};

gulp.task('serve', serve);

const minifySW = () => gulp.src('build/service-worker.js')
  .pipe($.babel(BABELRC))
  .pipe($.babelMinify())
  .pipe(gulp.dest('build'));

gulp.task('minify-sw', minifySW);

const html = () => gulp.src('build/**/*.html')
  .pipe($.htmlmin({
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    quoteCharacter: '"',
    removeComments: true
  }))
  .pipe(gulp.dest('build'));

gulp.task('html', html);

const deploy = gulp.series(
  gulp.parallel('html', 'minify-sw'),
  () => {
    const date = new Date();
    const formattedDate = date.toUTCString();

    return gulp.src('build/**/*')
      .pipe($.ghPages({
        remoteUrl: 'git@github.com:vitaliy-bobrov/vitaliy-bobrov.github.io.git',
        branch: 'master',
        message: `Updates blog content ${formattedDate}`
      }));
  }
);

gulp.task('deploy', deploy);

const seo = done => {
  request(`http://www.google.com/webmasters/tools/ping?sitemap=${SITEMAP_URL}`);
  request(`http://www.bing.com/webmaster/ping.aspx?siteMap=${SITEMAP_URL}`);
  done();
};

gulp.task('seo', seo);

const generateSW = () => {
  const rootDir = 'build';
  const filepath = path.join(rootDir, 'service-worker.js');
  const ONE_YEAR_IN_SEC = 31557600;
  const ONE_WEEK_IN_SEC = 604800;

  return workboxBuild.generateSW({
    swDest: filepath,
    importWorkboxFrom: 'local',
    cacheId: pkg.name,
    offlineGoogleAnalytics: true,
    globDirectory: rootDir,
    globPatterns: [
      '*.html',
      'images/icons/**/*',
      'images/authors/**/*',
      'images/!(*-og.jpg)',
      'js/**/*.js',
      'css/**/*.css',
      'about/*.html',
      'speaker/*.html'
    ],
    runtimeCaching: [
      {
        urlPattern: new RegExp('\.(?:googleapis|gstatic|google-analytics)\.com/'),
        handler: 'staleWhileRevalidate',
        options: {
          cacheName: 'gapi',
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: new RegExp('\.(?:bobrov-blog\.disqus|disquscdn)\.com/'),
        handler: 'staleWhileRevalidate',
        options: {
          cacheName: 'disqus',
          cacheableResponse: {
            statuses: [0, 200]
          },
          matchOptions: {
            ignoreSearch: true
          }
        }
      },
      {
        urlPattern: /.*\.(png|jpg|gif|webp|svg)/i,
        handler: 'cacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: ONE_YEAR_IN_SEC
          }
        }
      },
      {
        urlPattern: /\/blog\/.*\.html/,
        handler: 'cacheFirst',
        options: {
          cacheName: 'posts-cache',
          expiration: {
            maxEntries: 24,
            maxAgeSeconds: ONE_WEEK_IN_SEC
          }
        }
      },
      {
        urlPattern: /\/(category|page)\/.*\.html/,
        handler: 'cacheOnly',
        options: {
          cacheName: 'category-cache',
          expiration: {
            maxEntries: 72,
            maxAgeSeconds:  ONE_WEEK_IN_SEC
          }
        }
      }
    ],
    modifyUrlPrefix: {
      [`/${rootDir}`]: ''
    }
  }).then(({count, size, warnings}) => {
    warnings.forEach(console.warn);
    console.log(`${count} files will be precached, totaling ${size} bytes.`);
  });
};

gulp.task('service-worker', generateSW);

const defaultTask = gulp.series(
  'clean',
  gulp.parallel(
    'styles',
    'images',
    gulp.series('lint', gulp.parallel('scripts', 'paint')),
    'service-files',
    'metalsmith'
  ),
  'service-worker'
);

gulp.task('default', defaultTask);
