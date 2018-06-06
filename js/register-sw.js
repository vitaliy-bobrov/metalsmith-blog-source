((window, document) => {
  'use strict';

  const notification = document.querySelector('.mdl-js-snackbar');
  const addBtn = document.querySelector('.js-add-to-home');

  /**
   * Registers SW.
   */
  function register() {
    navigator.serviceWorker.register('/service-worker.js', {
      updateViaCache: 'none'
    })
      .then(registration => {
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = () => {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            const installingWorker = registration.installing;
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
        ga('send', 'event', 'Service Worker', 'error');
        console.error('Error during service worker registration:', e);
      });
  }

  let installPromptEvent;
  let tid;
  const INSTALL_TIME = 5 * 1000 * 60;

  /**
   * Shows intall prompt to the user.
   */
  function showInstallPrompt() {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();

    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        ga('send', 'event', 'Service Worker', 'prompt:accept');
      } else {
        ga('send', 'event', 'Service Worker', 'prompt:declined');
      }

      addBtn.disabled = true;
      installPromptEvent = null;
    });
  }

  /**
   * Shows intall snackbar to the user.
   */
  function showInstallSnack() {
    const data = {
      message: `Seems that you enjoyed reading!
      Would you like to add the blog to your home screen?`,
      actionHandler: showInstallPrompt,
      actionText: 'Add',
      timeout: 10000
    };

    ga('send', 'event', 'Service Worker', 'prompt');
    clearTimeout(tid);
    notification.MaterialSnackbar.showSnackbar(data);
  }

  window.addEventListener('beforeinstallprompt', event => {
    // Prevent Chrome <= 67 from automatically showing the prompt.
    event.preventDefault();
    // Stash the event so it can be triggered later.
    installPromptEvent = event;

    addBtn.disabled = false;
    tid = setTimeout(showInstallSnack, INSTALL_TIME);
  });

  window.addEventListener('appinstalled', () => {
    ga('send', 'event', 'Service Worker', 'install');
  });

  addBtn.addEventListener('click', event => {
    event.preventDefault();
    showInstallPrompt();
  }, false);

  if ('serviceWorker' in navigator &&
      window.location.protocol === 'https:') {
    window.addEventListener('load', register);
  }
})(window, document);
