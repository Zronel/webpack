// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": {
    // to edit target browsers: use "browserslist" field in package.json
    "postcss-import": {},
    "autoprefixer": {
      browsers: ['Android >= 4', 'Chrome >= 35', 'iOS >= 7', 'Safari >= 7.1']
    }
  }
}