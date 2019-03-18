((window, document) => {
  'use strict';

  const notification = document.querySelector('.mdl-js-snackbar');
  const addBtn = document.querySelector('.js-add-to-home');

  /**
   * Shows new content snackbar.
   * @param {Object} registration - SW registration.
   */
  function showRefreshUI(registration) {
    const data = {
      message: 'New content is available',
      actionHandler: () => {
        if (!registration.waiting) return;
        registration.waiting.postMessage('skipWaiting');
        window.location.reload();
      },
      actionText: 'Refresh',
      timeout: 10000
    };

    window.dataLayer.push({'event': 'sw:update'});
    notification.MaterialSnackbar.showSnackbar(data);
  }

  /**
   * Handles new SW.
   * @param {Object} registration - SW registration.
   * @param {Function} callback - callback to execute.
   * @return {Function}
   */
  function onNewServiceWorker(registration, callback) {
    if (registration.waiting) {
      // SW is waiting to activate. Can occur if multiple clients open and
      // one of the clients is refreshed.
      return callback(registration);
    }

    /**
     * Handles state change.
     */
    function listenInstalledStateChange() {
      registration.installing.addEventListener('statechange', function(event) {
        if (event.target.state === 'installed') {
          // A new service worker is available, inform the user
          callback(registration);
        }
      });
    }

    if (registration.installing) {
      return listenInstalledStateChange();
    }

    // We are currently controlled so a new SW may be found...
    // Add a listener in case a new SW is found,
    registration.addEventListener('updatefound', listenInstalledStateChange);
  }

  /**
   * Registers SW.
   */
  function register() {
    navigator.serviceWorker.register('/service-worker.js', {
      updateViaCache: 'none'
    }).then(registration => {
      if (!navigator.serviceWorker.controller) return;

      // When the user asks to refresh the UI, we'll need to reload the window
      let preventDevToolsReloadLoop;
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        // Ensure refresh is only called once.
        // This works around a bug in "force update on reload".
        if (preventDevToolsReloadLoop) return;
        preventDevToolsReloadLoop = true;
        window.location.reload();
      });

      onNewServiceWorker(registration, showRefreshUI);
    }).catch(e => {
      window.dataLayer.push({'event': 'sw:error'});
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
        window.dataLayer.push({'event': 'sw:prompt:accept'});
      } else {
        window.dataLayer.push({'event': 'sw:prompt:declined'});
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

    window.dataLayer.push({'event': 'sw:prompt'});
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
    window.dataLayer.push({'event': 'sw:install'});
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
