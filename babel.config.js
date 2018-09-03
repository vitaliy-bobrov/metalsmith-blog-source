const env = process.env.NODE_ENV;

module.exports = {
  presets: [
    env === 'production' &&
    [
      '@babel/preset-env',
      {
        loose: true
      }
    ]
  ]
  .filter(Boolean)
};
