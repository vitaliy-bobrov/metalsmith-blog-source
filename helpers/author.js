const gitAvatar = (username, size) => {
  username = username.replace('https://github.com/', '');
  let link = `https://avatars.githubusercontent.com/${username}`;

  if (size && !isNaN(size)) {
    link = `${link}?size=${size}`;
  }

  return link;
}

module.exports = {
  gitAvatar
};
