const activeLink = (path, link) => path === link ? 'mdl-navigation__link_active' : '';

const currentLink = (path, link) => path === link ? 'aria-current="page"' : '';

module.exports = {
  activeLink,
  currentLink
};
