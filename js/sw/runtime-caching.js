/* eslint-env worker, serviceworker */
(global => {
  'use strict';

  global.toolbox.router.get('/(.*)', global.toolbox.fastest, {
    origin: /\.(?:googleapis|gstatic|disqus)\.com$/
  });
})(self);
