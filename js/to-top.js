((window, document) => {
  'use strict';

  let supportsPassive;

  try {
    let opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
      }
    });

    window.addEventListener('test', null, opts);
  } catch (err) {
    console.error(err);
  }

  const toTop = document.querySelector('.js-to-top');
  const toTopVisible = 'to-top_visible';
  const container = document.querySelector('.js-to-top-container');
  const treshold = innerHeight / 2;

  toTop.addEventListener('click', event => {
    event.preventDefault();

    container.scrollTop = 0;
  }, false);

  container.addEventListener('scroll', () => {
    if (container.scrollTop > treshold) {
      toTop.classList.add(toTopVisible);
    } else {
      toTop.classList.remove(toTopVisible);
    }
  }, supportsPassive ? {passive: true} : false);
})(window, document);
