const postCell = (index, length) => {
  let desktop;
  let tablet;

  if (length < 8 && (index === length - 1 || index === length - 2)) {
    index = index - length;
  }

  switch (index) {
    case 0:
      desktop = 12;
      tablet = 6;
      break;

    case 1:
      desktop = 6;
      tablet = 6;
      break;

    case 2:
      desktop = 6;
      tablet = 12;
      break;

    case 3:
      desktop = 12;
      tablet = 6;
      break;

    case 4:
      desktop = 7;
      tablet = 6;
      break;

    case 5:
      desktop = 5;
      tablet = 12;
      break;

    case 6:
      desktop = 5;
      tablet = 6;
      break;

    case 7:
      desktop = 7;
      tablet = 6;
      break;

    default:
      desktop = 12;
      tablet = 12;
      break;
  }

  return `mdl-cell--${desktop}-col-desktop mdl-cell--${tablet}-col-tablet mdl-cell--12-col-phone`;
};

const postIllustration = (tumb, alt) => `
    <picture class="safe-picture">
      <source srcset="${tumb}.webp 1x, ${tumb}@2x.webp 2x"
              type="image/webp">
      <source srcset="${tumb}.jpg 1x, ${tumb}@2x.jpg 2x">
      <img src="${tumb}.jpg" alt="${alt}" class="safe-picture__img">
    </picture>`;

module.exports = {
  postCell,
  postIllustration
};
