const url = require('url');

const gitAvatar = (gitLink, size) => {
  let username = gitLink.replace('https://github.com/', '');
  let link = url.resolve('https://avatars.githubusercontent.com/', username);

  if (size && !isNaN(size)) {
    link = `${link}?size=${size}`;
  }

  return link;
}

module.exports = {
  gitAvatar
};
