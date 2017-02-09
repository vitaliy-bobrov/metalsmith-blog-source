(global => {
  'use strict';

  global.toolbox.router.get('/(.*)', global.toolbox.fastest, {
    origin: /\.(?:googleapis|gstatic|google-analytics|bobrov-blog.disqus)\.com$/
  });
})(self);
