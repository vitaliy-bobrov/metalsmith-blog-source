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

    const target = event.target.parentNode;
    const data = {
      title: target.dataset.shareTitle,
      text: target.dataset.shareText,
      url: target.dataset.shareUrl
    };

    nativeShare(data);
  };

  Array.prototype.forEach.call(buttons, btn => {
    if (navigator.share) {
      btn.addEventListener('click', shareHanler, false);
    } else {
      let menu = btn.parentNode.querySelector('.js-share-menu');
      menu.setAttribute('for', btn.id);
    }
  });
})(document, navigator);
