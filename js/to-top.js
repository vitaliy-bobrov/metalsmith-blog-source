(document => {
  'use strict';

  let toTop = document.querySelector('.js-to-top');
  let container = document.querySelector('.js-to-top-container');

  toTop.addEventListener('click', event => {
    event.preventDefault();

    container.scrollTop = 0;
  }, false);
})(document);
