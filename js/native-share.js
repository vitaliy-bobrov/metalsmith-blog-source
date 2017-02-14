((document, navigator, ga) => {
  'use strict';

  const buttons = document.querySelectorAll('.js-share-btn');
  const notification = document.querySelector('.mdl-js-snackbar');
  const SHARE_CATEGORY = 'Share';
  let config;

  const nativeShare = data => {
    navigator.share(data)
      .then(() => {
        config = {
          message: 'Thank you for sharing this post!',
          timeout: 5000
        };
        notification.MaterialSnackbar.showSnackbar(config);
        ga('send', 'event', SHARE_CATEGORY, 'click', 'Native Share');
      })
      .catch(() => {
        config = {
          message: 'Sharing failed!',
          actionHandler: () => {
            nativeShare(data);
          },
          actionText: 'Retry',
          timeout: 5000
        };
        notification.MaterialSnackbar.showSnackbar(config);
      });
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
})(document, navigator, ga);
