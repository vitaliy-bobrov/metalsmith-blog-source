((document, ga) => {
  'use strict';

  let toTop = document.querySelector('.js-to-top');
  let container = document.querySelector('.js-to-top-container');

  toTop.addEventListener('click', event => {
    event.preventDefault();
    ga('send', 'event', 'Page', 'click', 'Scroll Top');

    container.scrollTop = 0;
  }, false);
})(document, ga);
