const url = require('url');
const escape = require('escape-html');

const absoluteUrl = (siteurl, path) => `${url.resolve(siteurl, path)}/`;

const ampUrl = (siteurl, path) => `${url.resolve(siteurl, path)}/amp/`;

const postCell = (index, length) => {
  let desktop;
  let tablet;

  switch (index) {
    case 0:
      desktop = 12;
      break;

    case 1:
      desktop = 6;
      break;

    case 2:
      desktop = 6;
      break;

    case 3:
      desktop = 12;
      break;

    case 4:
      desktop = 7;
      break;

    case 5:
      desktop = 5;
      break;

    case 6:
      desktop = 5;
      break;

    case 7:
      desktop = 7;
      break;

    default:
      desktop = 12;
      break;
  }

  if (length % 2 !== 0 && index === length - 1) {
    desktop = 12;
  }

  return `mdl-cell--${desktop}-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone`;
};

const postIllustration = (tumb, alt) => `
    <picture class="safe-picture">
      <source media="(min-width: 1025px)"
              srcset="${tumb}.webp 1x, ${tumb}@2x.webp 2x"
              type="image/webp">
      <source media="(min-width: 1025px)"
              srcset="${tumb}.jpg 1x, ${tumb}@2x.jpg 2x">
      <source media="(min-width: 768px)"
              srcset="${tumb}-tablet.webp 1x, ${tumb}-tablet@2x.webp 2x"
              type="image/webp">
      <source media="(min-width: 768px)"
              srcset="${tumb}-tablet.jpg 1x, ${tumb}-tablet@2x.jpg 2x">
      <source srcset="${tumb}-mobile.webp 1x, ${tumb}-mobile@2x.webp 2x"
              type="image/webp">
      <source srcset="${tumb}-mobile.jpg 1x, ${tumb}-mobile@2x.jpg 2x">
      <img src="${tumb}.jpg" alt="${alt}" class="safe-picture__img">
    </picture>`;

const postShare = (title, description, siteurl, path, id = 0) => {
  let link = url.resolve(siteurl, path);

  return `
    <div class="mdl-card__menu post-share">
      <button id="share-menu-${id}"
              class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect post-share__button js-share-btn"
              title="Share this post"
              aria-label="Share this post"
              data-share-title="${escape(title)}"
              data-share-text="${escape(description)}"
              data-share-url="${link}">
        <svg class="mdl-svg post-share__icon">
          <use xlink:href="#share"></use>
        </svg>
      </button>
      <ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect share-menu js-share-menu">
        <li class="mdl-menu__item share-menu__item">
          <a href="//www.facebook.com/sharer.php?u=${link}"
             class="share-menu__link"
             target="_blank"
             rel="nofollow noreferrer noopener">
            <svg class="share-menu__icon">
              <use xlink:href="#facebook"></use>
            </svg>
            Facebook
          </a>
        </li>
        <li class="mdl-menu__item share-menu__item">
          <a href="//twitter.com/home?status=${link}"
             class="share-menu__link"
             target="_blank"
             rel="nofollow noreferrer noopener">
            <svg class="share-menu__icon">
              <use xlink:href="#twitter"></use>
            </svg>
            Twitter
          </a>
        </li>
        <li class="mdl-menu__item share-menu__item">
          <a href="//linkedin.com/shareArticle?url=${link}"
             class="share-menu__link"
             target="_blank"
             rel="nofollow noreferrer noopener">
            <svg class="share-menu__icon">
              <use xlink:href="#linkedin"></use>
            </svg>
            LinkedIn
          </a>
        </li>
        <li class="mdl-menu__item share-menu__item">
          <a href="//plus.google.com/share?url=${link}"
             class="share-menu__link"
             target="_blank"
             rel="nofollow noreferrer noopener">
            <svg class="share-menu__icon">
              <use xlink:href="#google-plus"></use>
            </svg>
            Goggle+
          </a>
        </li>
      </ul>
    </div>`;
};

module.exports = {
  absoluteUrl,
  ampUrl,
  postCell,
  postIllustration,
  postShare
};
