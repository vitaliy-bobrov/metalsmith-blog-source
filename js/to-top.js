((window, document) => {
  'use strict';

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
  }, window.__supportsPassive ? {passive: true} : false);
})(window, document);
