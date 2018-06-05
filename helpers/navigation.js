function sanitizePostPath(path) {
  return path.replace(/blog\/*.+/, '');
}

const activeLink = (path, link) => sanitizePostPath(path) === link ? 'mdl-navigation__link_active' : '';

const currentLink = (path, link) => path === link ? 'aria-current="page"' : '';

module.exports = {
  activeLink,
  currentLink
};
