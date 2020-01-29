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
const systemUiFont = require('postcss-font-family-system-ui');
const exec = require('child_process').exec;
const request = require('request');
const url = require('url');
const workboxBuild = require('workbox-build');
const pkg = require('./package.json');

const $ = gulpLoadPlugins();
const server = browserSync.create();

const onError = function(error) {
  console.log(error.toString());
  this.emit('end');
};

const reload = (done) => {
  server.reload();
  done();
};

const prod = process.env.NODE_ENV === 'production';
const LOCAL_PORT = 3000;
const PROD_URL = 'https://bobrov.dev/';
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
const terserOptions = {
  mangle: { toplevel: true }
};

const svg = () => gulp.src('images/svg/*.svg')
  .pipe($.plumber({
    errorHandler: onError
  }))
  .pipe($.svgSprite({
    mode: {
      defs: {
        dest: './',
        sprite: '../images/sprite.svg',
        inline: true
      }
    }
  }))
  .pipe(gulp.dest('partials'))
  .pipe($.size({title: 'svg'}));

gulp.task('svg', svg);

const metalsmith = (done) => exec(
    `node ./metalsmith.js --url=${PROD_URL}`,
    (err, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      done(err);
    }
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
    '!./images/posts/**/img/*.{jpg,jpeg,png,gif}',
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
  () => gulp.src('./images/**/*.{jpg,jpeg,png,gif,webp,svg}')
    .pipe(gulp.dest('build/images'))
    .pipe($.size({title: 'images'}))
);

gulp.task('images', images);

const audio = () => gulp.src('./audio/**/*.{wav}')
  .pipe(gulp.dest('build/audio'))
  .pipe($.size({title: 'audio'}))

gulp.task('audio', audio);

const styles = () => {
  const processors = [
    assets({
      basePath: './',
      baseUrl: '../',
      loadPaths: ['images/']
    }),
    systemUiFont,
    autoprefixer,
    mqpacker({sort: true}),
    mqkeyframes
  ];

  return gulp.src('scss/**/*.scss', {sourcemaps: !prod})
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe($.dartSass({
      includePaths: [
        'node_modules/material-design-lite/src/',
        'node_modules/mdl-ext/src'
      ],
      outputStyle: 'expanded',
      precision: 10
    }).on('error', $.dartSass.logError))
    .pipe($.postcss(processors))
    .pipe($.if(prod, $.uncss({
      html: ['build/**/*.html'],
      ignore: [
        /^.*is-(compact|small-screen|visible|active|animating|upgraded).*/,
        /^.*mdl-(menu|button|snackbar).*/,
        /^.*ripple-ink_animate.*/,
        /^.*commento-root.*/
      ]
    })))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe(gulp.dest('build/css', {sourcemaps: prod ? false : '.'}));
};

gulp.task('styles', styles);

const scripts = () => gulp.src([
    'node_modules/material-design-lite/src/mdlComponentHandler.js',
    'node_modules/material-design-lite/src/menu/menu.js',
    'node_modules/material-design-lite/src/snackbar/snackbar.js',
    'js/*.js'
  ], {sourcemaps: !prod})
  .pipe($.plumber({
    errorHandler: onError
  }))
  .pipe($.babel(BABELRC))
  .pipe($.concat('main.min.js'))
  .pipe($.if(prod, $.terser(terserOptions)))
  .pipe($.size({title: 'scripts'}))
  .pipe(gulp.dest('build/js', {sourcemaps: prod ? false : '.'}));

gulp.task('scripts', scripts);

const separateScripts = () => gulp.src(['js/paint/*.js', 'js/sw/*.js'])
  .pipe($.plumber({
    errorHandler: onError
  }))
  .pipe($.if(prod, $.terser(terserOptions)))
  .pipe(gulp.dest('build/js'));

gulp.task('separateScripts', separateScripts);

const clean = once((done) => {
  del([
    'build/images',
    'build/audio',
    'build/js',
    'build/css',
    'build/workbox-*'
  ], {dot: true}).then(() => done());
});

gulp.task('clean', clean);

const bs = (done) => {
  server.init({
    notify: false,
    logPrefix: 'MetalSync',
    scrollElementMapping: ['main', '.mdl-layout'],
    server: ['build'],
    port: LOCAL_PORT
  });

  done();
};

gulp.task('bs', bs);

const watch = () => {
  gulp.watch([
    'layouts/**/*.html',
    'partials/**/*.html',
    'source/**/*.md'
  ], gulp.series('metalsmith', reload));
  gulp.watch(['scss/**/*.scss'], gulp.series('styles', reload));
  gulp.watch(['js/**/*.js'], gulp.series('lint', 'scripts', 'separateScripts', reload));
  gulp.watch(['images/**/*'], reload);
};

gulp.task('watch', watch);

gulp.task('serve', gulp.series('bs', 'watch'));

const minifySW = () => gulp.src('build/service-worker.js')
  .pipe($.babel(BABELRC))
  .pipe($.terser(terserOptions))
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
    importScripts: ['js/skip-waiting.js'],
    globPatterns: [
      '*.html',
      'images/icons/**/*',
      'images/authors/**/*',
      'images/!(*-og.jpg)',
      // 'audio/**/*.wav',
      'js/**/*.js',
      'css/**/*.css',
      'about/*.html',
      'speaker/*.html'
    ],
    runtimeCaching: [
      {
        urlPattern: new RegExp('\.commento\.io/'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'commento',
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
        handler: 'CacheFirst',
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
        handler: 'CacheFirst',
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
        handler: 'CacheOnly',
        options: {
          cacheName: 'category-cache',
          expiration: {
            maxEntries: 72,
            maxAgeSeconds:  ONE_WEEK_IN_SEC
          }
        }
      }
    ],
    modifyURLPrefix: {
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
    'audio',
    gulp.series('lint', gulp.parallel('scripts', 'separateScripts')),
    'service-files',
    gulp.series('svg', 'metalsmith')
  ),
  'service-worker'
);

gulp.task('default', defaultTask);
