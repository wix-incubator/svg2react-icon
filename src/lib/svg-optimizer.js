const SVGO = require('svgo');

const svgo = new SVGO({
  plugins: [
    {removeViewBox: false},
    {removeStyleElement: true},
    {removeScriptElement: true},
    {cleanupIDs: false}
  ]
});

const svgoMonochrome = new SVGO({
  plugins: [
    {removeViewBox: false},
    {removeStyleElement: true},
    {removeScriptElement: true},
    {cleanupIDs: false},
    {removeAttrs: {attrs: '(stroke|fill)'}}
  ]
});

module.exports = (svgString, monochrome) =>
  (monochrome ? svgoMonochrome : svgo)
    .optimize(svgString, {})
    .then(result => result.data);
