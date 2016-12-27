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

  return `mdl-cell--${desktop}-col-desktop`;
};

module.exports = {
  postCell
};
