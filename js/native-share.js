((document, navigator) => {
  'use strict';

  const buttons = document.querySelectorAll('.js-share-btn');
  const notification = document.querySelector('.mdl-js-snackbar');

  const nativeShare = data => {
    navigator.share(data)
      .then(() => {
        notification.MaterialSnackbar.showSnackbar({
          message: 'Thank you for sharing this post!',
          timeout: 5000
        });
        ga('send', 'event', 'Share', 'click', 'Native Share');
      })
      .catch(err => {
        notification.MaterialSnackbar.showSnackbar({
          message: 'Sharing failed!',
          actionHandler: () => {
            nativeShare(data);
          },
          actionText: 'Retry',
          timeout: 5000
        });
      });
  };

  const shareHandler = event => {
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
    if (
      'share' in navigator &&
      matchMedia('all and (max-width: 768px)').matches
    ) {
      btn.addEventListener('click', shareHandler, false);
    } else {
      let menu = btn.parentNode.querySelector('.js-share-menu');
      menu.setAttribute('for', btn.id);
    }
  });
})(document, navigator);
