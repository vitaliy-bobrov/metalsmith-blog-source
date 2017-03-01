/* eslint-env worker, serviceworker */
(global => {
  'use strict';

  const ONE_YEAR_IN_SEC = 31557600;

  global.toolbox.router.get('/(.*)', global.toolbox.cacheFirst, {
    cache: {
      name: 'googleapis',
      maxAgeSeconds: ONE_YEAR_IN_SEC
    },
    origin: /\.(?:googleapis|gstatic)\.com$/
  });

  global.toolbox.router.get('/(.*)', global.toolbox.cacheFirst, {
    cache: {
      name: 'disqus',
      maxAgeSeconds: ONE_YEAR_IN_SEC
    },
    origin: /\.(?:disqus)\.com$/
  });
})(self);
