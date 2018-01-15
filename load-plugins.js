const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const camelCaseEscape = (slug, delimiter, escape) =>  slug.replace(escape, '')
  .split(delimiter)
  .reduce((name, item, index) => index ? name + capitalize(item) : name + item, '');

const loadPlugins = (package, level, prefix) => {
  return Object.keys(package[level])
    .reduce((plugins, dep) => {
      if (dep.indexOf(prefix) === 0) {
        plugins[camelCaseEscape(dep, '-', prefix)] = require(dep);
      }

      return plugins;
    }, {});
};

module.exports = loadPlugins;
