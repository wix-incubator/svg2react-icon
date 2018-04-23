const SVGO = require('svgo');

const svgo = new SVGO({
  plugins: [
    {removeViewBox: false},
    {removeStyleElement: true},
    {removeScriptElement: true}
  ]
});

const svgoMonochrome = new SVGO({
  plugins: [
    {removeViewBox: false},
    {removeStyleElement: true},
    {removeScriptElement: true},
    {removeAttrs: {attrs: '(stroke|fill)'}}
  ]
});

module.exports = (svgString, monochrome, attributeStrip) =>
  (monochrome && attributeStrip ? svgoMonochrome : svgo)
  .optimize(svgString)
  .then(result => result.data);
