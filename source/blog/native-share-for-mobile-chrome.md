---
title: Native Share for Mobile Chrome
description: Improve you users experience with native share widget on Android devices.
ogimage: images/posts/native-share-for-mobile-chrome/native-share-for-mobile-chrome-og.jpg
tumb: /images/posts/native-share-for-mobile-chrome/native-share-for-mobile-chrome
created: 2017-02-15
categories:
- Guides
---
New features come to Web standards every day and their goal to improve user experience visitors of your web page. Sharing to social networks is one of the must-have features in modern web. Today I want to show how easy add native share widget for your users on Android devices with Chrome 55+.

Web Share API is an experimental feature available in Chrome for Android from 2016, but it came as an unflagged feature only to Chrome 55. There is only one difficulty to use that feature now -- you need to sign up form to get [Origin Trial](https://github.com/jpchase/OriginTrials/blob/gh-pages/developer-guide.md) token because the feature is still experimental. This limitation will present till April 2017, and then it'll be possible just to use Web Share as any other browser API. Read down the fast & straightforward step-by-step guide how to add native sharing in your project.

## Step 1: Pre-requirements
Like many other modern features like Service Worker, Web Share requires the secure connection (HTTPS) to your resource. Another requirement is to fill [form](https://docs.google.com/forms/d/e/1FAIpQLSfO0_ptFl8r8G0UFhT0xhV17eabG-erUWBDiKSRDTqEZ_9ULQ/viewform?entry.1999497328=Web+Share+(Experimenting+until+April+2017)) to get Origin Trial token. After filling it, you'll receive a token that could be used only for domain and sub-domain you write (as well as `localhost` for local testing). This token is needed only until April 2017. Then you must add the meta tag with a token to the page's head section:

```html
<!-- Origin Trials -->
<meta http-equiv="origin-trial" data-feature="Web Share" data-expires="DATE" content="YOUR_TOKEN">
```

`data-expires` attribute is not required to be present on that tag, but you should renew token if it expires.

And finally, the main restriction -- share action should be invoked with user action like click, tap, etc. It is the logical requirement to avoid speculations with Web Share API by some "marketing" trickers.

## Step 2: Add trigger in markup
As we need user interaction to call native share some trigger needs to be added to the page markup. It may be just a link to some share URL for users that will not have a share feature in their browser or like in my case buttons that trigger sharing menu for such users.

```html
<!-- Link example -->
<a href="//twitter.com/home?status=LINK_TO_PAGE" class="js-share-link">Share on Twitter</a>

<!-- Share menu example -->
<button class="js-share-button">Share this page</button>
<aside role="menu" class="js-share-menu">
  <!-- List of sharing links -->
</aside>
```

## Step 3: JavaScript handler
And the last stage -- we need to add JavaScript code to call share in the browser that supports Web Share API and alternative variant to other users.

### Share function
This function will get an object with three possible properties needed for sharing: title, text, url. Note that one -- text or url must be passed to `navigator.share` method, as well as both of them. All properties must be a string. Share returns `Promise` and you could handle success and error results with `then` and `catch` methods.

Success callback can be used to notify and thank the user for sharing, sending data to analytics and so on.![Thank you for share message](/images/posts/native-share-for-mobile-chrome/img/thanks.jpg)

Error callback can be used to log error or as I did -- notify a user about failed sharing and ask to try again.![Ask user to retry share after error](/images/posts/native-share-for-mobile-chrome/img/retry.jpg)

```js
const nativeShare = data => navigator.share(data)
  .then(() => {
    // Here might be code to thank and notify a user.
  })
  .catch(error => console.error('Error sharing:', error));
```
### Share data function
We need some function to prepare object with sharing data. This data could be gathered from any part of your source and depend on current context. For example in share action will share current page you could use `document.title`, current or canonical url, page description, also if you have [OpenGraph](http://ogp.me/) meta tags or [JSON-LD](http://json-ld.org/) data on your page its content can be used. In my situation, I wanted to add share widget to each item in posts list on blog pages, so I stored needed data in `data-attributes`.

```js
const getShareData = (target = {}) => {
  let title = '';
  let text = '';
  let url = '';

  if (target) {
    title = target.dataset.shareTitle;
    text = target.dataset.shareText;
    url = target.dataset.shareUrl;
  } else {
    // Use document title.
    title = document.title;
    // Used cannonical link.
    text = document.querySelector('link[rel="cannonical"]')
      .getAttribute('href');
    // Used OpenGraph tag.
    url = document.querySelector('[property="og:description"]')
      .getAttribute('content');
  }

  return {
    title,
    text,
    url
  }
};
```

### Single link example
```js
const link = document.querySelector('.js-share-link');

const onLinkClick = event => {
  event.preventDefault();

  nativeShare(getShareData(event.target));
};

if (navigator.share) {
  link.addEventListener('click', onLinkClick);
}
```

If share feature available in users browser we prevent the standard behavior gather data for sharing and call `share` method. If Web Share is not available or any of requirements not achieved user will follow default Twitter link. So in both cases, the hyperlink will be functional.

### Share menu example
```js
const button = document.querySelector('.js-share-button');
const menu = document.querySelector('.js-share-menu');

const onButtonClick = event => {
  event.preventDefault();

  if (navigator.share) {
    nativeShare(getShareData(event.target));
  } else {
    // Show custom menu.
    menu.classList.add('share-menu_visible');
  }
};

button.addEventListener('click', onButtonClick);
```

By taping on the share button user gets native share widget.![Native share in Chrome for Android](/images/posts/native-share-for-mobile-chrome/img/share-native.jpg)

If Web Share not supported -- custom share menu will be shown.![Share custom menu](/images/posts/native-share-for-mobile-chrome/img/share-menu.jpg)

All my examples don't provide completed monolith implementation, as the developer I want to give you a choice. All this code is a guideline and final decisions up-to-you. Web Share API is simple and cost nothing to add and improve your projects UX.
