const postCell = index => {
  let desktop;

  switch (index) {
    case 1:
    case 2:
      desktop = 6;
      break;

    case 4:
    case 7:
      desktop = 7;
      break;

    case 5:
    case 6:
      desktop = 5;
      break;

    case 0:
    case 3:
    default:
      desktop = 12;
      break;
  }

  return `mdl-cell--${desktop}-col-desktop mdl-cell--6-col-tablet mdl-cell--12-col-phone`;
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
