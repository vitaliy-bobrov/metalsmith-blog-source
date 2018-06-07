(document => {
  'use strict';

  const rippleClass = 'ripple';
  const inkClass = 'ripple-ink';
  const animateClass = `${inkClass}_animate`;

  /**
   * Deactivate link on animation end.
   * @param {Object} event - object with event data.
   * @return {HTMLElement} - event target.
   */
  const deactivateInk = event => event.target.classList.remove(animateClass);

  /**
   * Ripple effect.
   * @param {Object} event - object with event data.
   */
  const rippleHandler = event => {
    const element = event.target;
    const ripple = element.querySelector(`.${inkClass}`);

    if (ripple) {
      if (!ripple.offsetHeight && !ripple.offsetWidth) {
        ripple.effectSize = Math.max(element.offsetWidth, element.offsetHeight);
        ripple.style.width = ripple.style.height = `${ripple.effectSize}px`;
      }

      ripple.style.top = `${event.offsetY - ripple.effectSize / 2}px`;
      ripple.style.left = `${event.offsetX - ripple.effectSize / 2}px`;

      ripple.classList.add(animateClass);
    }
  };

  const parents = document.querySelectorAll(`.${rippleClass}`);

  if (parents) {
    Array.prototype.forEach.call(parents, parent => {
      const ripple = parent.querySelector('.ripple-ink');

      parent.addEventListener('click', rippleHandler);
      ripple.addEventListener('animationend', deactivateInk);
    });
  }
})(document);
