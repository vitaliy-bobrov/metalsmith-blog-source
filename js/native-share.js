((document, navigator) => {
  'use strict';

  const buttons = document.querySelectorAll('.js-share-btn');
  const notification = document.querySelector('.mdl-js-snackbar');
  let config;

  const nativeShare = data => {
    navigator.share(data)
      .then(() => {
        config = {
          message: 'Thank you for sharing this post!',
          timeout: 5000
        };
        notification.MaterialSnackbar.showSnackbar(config);
        ga('send', 'event', 'Share', 'click', 'Native Share');
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

    const dataset = event.target.parentNode.dataset;
    const data = {
      title: dataset.shareTitle,
      text: dataset.shareText,
      url: dataset.shareUrl
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
