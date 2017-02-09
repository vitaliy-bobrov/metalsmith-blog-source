(document => {
  'use strict';

  let timeoutId;

  const mdlCahngeIcon = () => {
    let button = document.querySelector('.mdl-layout__drawer-button');

    clearTimeout(timeoutId);

    if (button !== null) {
      button.innerHTML = `<svg class="mdl-svg drawer-icon">
          <use xlink:href="#menu"></use>
        </svg>`;
    } else {
      timeoutId = setTimeout(mdlCahngeIcon, 100);
    }
  };

  timeoutId = setTimeout(mdlCahngeIcon, 100);
})(document);
