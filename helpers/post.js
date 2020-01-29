const url = require('url');
const escape = require('escape-html');

const exclude = [
  '/images/logo',
  '/',
  ''
];

function shouldAddSlash(path) {
  if (exclude.includes(path)) return true;

  return path.indexOf('.html') === path.length - 5;
}

const absoluteUrl = (siteurl, path) => {
  const base = url.resolve(siteurl, path);
  const tail = shouldAddSlash(path) ? '' : '/';
  const result = `${base}${tail}`;

  return result;
};

const postCell = (index, length) => {
  let desktop;

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

const postIllustration = (tumb, alt, nolazy = false) => `
    <picture class="safe-picture ${nolazy ? '' : 'js-lazy-load'}">
      <source media="(min-width: 1025px)"
              ${nolazy ? '' : 'data-'}srcset="${tumb}.webp 1x, ${tumb}@2x.webp 2x"
              type="image/webp">
      <source media="(min-width: 1025px)"
              ${nolazy ? '' : 'data-'}srcset="${tumb}.jpg 1x, ${tumb}@2x.jpg 2x">
      <source media="(min-width: 768px)"
              ${nolazy ? '' : 'data-'}srcset="${tumb}-tablet.webp 1x, ${tumb}-tablet@2x.webp 2x"
              type="image/webp">
      <source media="(min-width: 768px)"
              ${nolazy ? '' : 'data-'}srcset="${tumb}-tablet.jpg 1x, ${tumb}-tablet@2x.jpg 2x">
      <source ${nolazy ? '' : 'data-'}srcset="${tumb}-mobile.webp 1x, ${tumb}-mobile@2x.webp 2x"
              type="image/webp">
      <source ${nolazy ? '' : 'data-'}srcset="${tumb}-mobile.jpg 1x, ${tumb}-mobile@2x.jpg 2x">
      <img ${nolazy ? '' : 'data-'}src="${tumb}.jpg" loading="${nolazy ? 'eager' : 'lazy'}" alt="${alt}" class="safe-picture__img">
    </picture>`;

const postShare = (title, siteurl, path, id = 0) => {
  let link = url.resolve(siteurl, `${path}/`);
  const headline = escape(title);

  return `
    <div class="mdl-card__menu post-share">
      <button id="share-menu-${id}"
              class="mdl-button mdl-button--icon ripple post-share__button js-share-btn"
              title="Share this post"
              aria-label="Share this post"
              data-share-title="${headline}"
              data-share-text="${headline} by @bobrov1989"
              data-share-url="${link}">
        <span class="ripple-ink"></span>
        <svg class="mdl-svg post-share__icon">
          <use xlink:href="/images/sprite.svg#share"></use>
        </svg>
        Share post
      </button>
      <ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu share-menu js-share-menu">
        <li class="mdl-menu__item share-menu__item">
          <a href="https://www.facebook.com/sharer.php?u=${link}"
             class="share-menu__link"
             target="_blank"
             rel="nofollow noreferrer noopener">
            <svg class="share-menu__icon">
              <use xlink:href="/images/sprite.svg#facebook"></use>
            </svg>
            Facebook
          </a>
        </li>
        <li class="mdl-menu__item share-menu__item">
          <a href="https://twitter.com/home?status=${link}"
             class="share-menu__link"
             target="_blank"
             rel="nofollow noreferrer noopener">
            <svg class="share-menu__icon">
              <use xlink:href="/images/sprite.svg#twitter"></use>
            </svg>
            Twitter
          </a>
        </li>
        <li class="mdl-menu__item share-menu__item">
          <a href="https://linkedin.com/shareArticle?url=${link}"
             class="share-menu__link"
             target="_blank"
             rel="nofollow noreferrer noopener">
            <svg class="share-menu__icon">
              <use xlink:href="/images/sprite.svg#linkedin"></use>
            </svg>
            LinkedIn
          </a>
        </li>
      </ul>
    </div>`;
};

module.exports = {
  absoluteUrl,
  postCell,
  postIllustration,
  postShare
};
