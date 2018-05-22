((window, document) => {
  'use strict';

  /**
   * Enabbles media sources.
   * @param {HTMLElement} element
   */
  function enableNodeSource(element) {
    const sourceType = element.nodeName === 'SOURCE' ? 'srcset' : 'src';

    element.setAttribute(sourceType, element.dataset[sourceType]);
  }

  /**
   * Enables each media element.
   * @param {HTMLElement} element
   */
  function enablePictureSource(element) {
    Array.prototype.forEach.call(element.children, enableNodeSource);
  }

  /**
   * Intersection callback.
   * @param {Object} entries
   * @param {Object} observer
   */
  function intersectionCallback(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);

        enablePictureSource(entry.target);
      }
    });
  }

  window.addEventListener('load', () => {
    const pictures = document.querySelectorAll('.js-lazy-load');

    if (pictures) {
      if (typeof IntersectionObserver !== 'undefined') {
        const options = {
          root: document.querySelector('.js-to-top-container'),
          threshold: 0
        };

        const observer = new IntersectionObserver(
          intersectionCallback,
          options
        );

        Array.prototype.forEach.call(pictures, picture => {
          observer.observe(picture);
        });
      } else {
        Array.prototype.forEach.call(pictures, enablePictureSource);
      }
    }
  }, false);
})(window, document);
