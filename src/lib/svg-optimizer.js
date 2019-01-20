const SVGO = require('svgo');

const svgo = new SVGO({
  plugins: [
    {removeViewBox: false},
    {removeStyleElement: true},
    {removeScriptElement: true},
    {cleanupIDs: false},
    {convertPathData: false}
  ]
});

const svgoMonochrome = new SVGO({
  plugins: [
    {removeViewBox: false},
    {removeStyleElement: true},
    {removeScriptElement: true},
    {cleanupIDs: false},
    {removeAttrs: {attrs: '(stroke|fill)'}},
    {convertPathData: false}
  ]
});

module.exports = (svgString, monochrome, info = {}) =>
  (monochrome ? svgoMonochrome : svgo)
    .optimize(svgString, info)
    .then(result => result.data);
