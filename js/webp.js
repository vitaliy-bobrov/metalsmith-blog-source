(document => {
  'use strict';

  /**
   * Test webP images support.
   * @param {Function} callback - Callback function.
   */
  const testWepP = callback => {
    let webP = new Image();

    webP.src = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wA' +
    'iMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA';
    webP.onload = webP.onerror = () => {
      callback(webP.height === 2);
    };
  };

  /**
   * Add 'webp' class to body if supported.
   * @param {Boolean} support - WebP format support.
   */
  const addWebPClass = support => {
    if (support) {
      document.body.classList.add('webp');
    }
  };

  document.addEventListener('DOMContentLoaded',
    testWepP(addWebPClass),
    false);
})(document);
