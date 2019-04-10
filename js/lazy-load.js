((window, document) => {
  'use strict';

  /**
   * Enables media sources.
   * @param {HTMLElement} element
   */
  function enableMediaSource(element) {
    const sourceType = element.nodeName === 'SOURCE' ? 'srcset' : 'src';
    const source = element.dataset[sourceType];

    if (source) {
      element.setAttribute(sourceType, element.dataset[sourceType]);
    }
  }

  /**
   * Enables each media element.
   * @param {HTMLElement} element
   */
  function enableSource(element) {
    switch (element.nodeName) {
      case 'PICTURE':
        Array.prototype.forEach.call(element.children, enableMediaSource);
        break;

      case 'IMAGE':
      case 'IFRAME':
        enableMediaSource(element);
        break;

      default: {
        const media = element.querySelectorAll('iframe, img, source');

        if (media) {
          Array.prototype.forEach.call(media, enableMediaSource);
        }

        break;
      }
    }
  }

  /**
   * Intersection callback.
   * @param {Object} entries
   * @param {Object} observer
   */
  function intersectionCallback(entries, observer) {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
        enableSource(entry.target);

        observer.unobserve(entry.target);
      }
    });
  }

  window.addEventListener('load', () => {
    const resources = document.querySelectorAll('.js-lazy-load');

    if (resources) {
      if ('loading' in HTMLImageElement.prototype ||
        typeof IntersectionObserver == 'undefined') {
        Array.prototype.forEach.call(resources, enableSource);
      } else {
        const options = {
          root: document.querySelector('.js-lazy-container'),
          threshold: 0.25
        };

        const observer = new IntersectionObserver(
            intersectionCallback,
            options
        );

        Array.prototype.forEach.call(resources, picture => {
          observer.observe(picture);
        });
      }
    }
  }, false);
})(window, document);
