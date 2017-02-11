((document, navigator) => {
  'use strict';

  let buttons = document.querySelectorAll('.js-share-btn');

  const nativeShare = data => {
    navigator.share(data)
      .then(() => {})
      .catch(error => console.error('Error sharing:', error));
  };

  const shareHanler = event => {
    event.preventDefault();

    const data = {
      title: event.target.dataset.shareTitle,
      text: event.target.dataset.shareText,
      url: event.target.dataset.shareUrl
    };

    nativeShare(data);
  };

  if (navigator.share !== undefined) {
    Array.prototype.forEach.call(buttons, btn => {
      btn.addEventListener('click', shareHanler, false);
    });
  } else {
    Array.prototype.forEach.call(buttons, btn => {
      let menu = btn.parentNode.querySelector('.js-share-menu');
      menu.setAttribute('for', btn.id);
    });
  }
})(document, navigator);
