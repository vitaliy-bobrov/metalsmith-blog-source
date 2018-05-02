((window, document) => {
  'use strict';

  function register() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        ga('send', 'event', 'Service Worker', 'install');
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = () => {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            const installingWorker = registration.installing;
            const notification = document.querySelector('.mdl-js-snackbar');
            const data = {
              message: 'New content is available',
              actionHandler: () => window.location.reload(),
              actionText: 'Refresh',
              timeout: 10000
            };

            installingWorker.onstatechange = () => {
              switch (installingWorker.state) {
                case 'installed':
                  ga('send', 'event', 'Service Worker', 'update');
                  notification.MaterialSnackbar.showSnackbar(data);

                  break;

                case 'redundant':
                  throw new Error('The installing ' +
                    'service worker became redundant.');

                default:
                  // Ignore
              }
            };
          }
        };
      }).catch(e => {
        console.error('Error during service worker registration:', e);
      });
  }

  if ('serviceWorker' in navigator &&
      window.location.protocol === 'https:') {
    window.addEventListener('load', register);
  }
})(window, document);
