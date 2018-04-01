const SVGO = require('svgo');

const svgo = new SVGO({
  plugins: [
    {removeStyleElement: {}},
    {removeTitle: true}
  ]
});

const svgoMonochrome = new SVGO({
  plugins: [
    {cleanupAttrs: true},
    {removeDoctype: true},
    {removeXMLProcInst: true},
    {removeComments: true},
    {removeMetadata: true},
    {removeTitle: true},
    {removeDesc: true},
    {removeUselessDefs: true},
    {removeXMLNS: true},
    {removeEditorsNSData: true},
    {removeEmptyAttrs: true},
    {removeHiddenElems: true},
    {removeEmptyText: true},
    {removeEmptyContainers: true},
    {removeViewBox: false},
    {cleanUpEnableBackground: true},
    {minifyStyles: false},
    {convertStyleToAttrs: false},
    {convertColors: false},
    {convertPathData: true},
    {convertTransform: true},
    {removeUnknownsAndDefaults: true},
    {removeNonInheritableGroupAttrs: true},
    {removeUselessStrokeAndFill: true},
    {removeUnusedNS: true},
    {cleanupIDs: true},
    {cleanupNumericValues: false},
    {moveElemsAttrsToGroup: false},
    {moveGroupAttrsToElems: true},
    {collapseGroups: true},
    {removeRasterImages: false},
    {mergePaths: true},
    {convertShapeToPath: true},
    {sortAttrs: true},
    {removeDimensions: true},
    {removeAttrs: {attrs: '(stroke|fill)'}},
    {removeStyleElement: true},
    {removeScriptElement: true}
  ]
});

const optimizeAsync = (svgContent, monochrome) => {
  return new Promise(resolve => {
    (monochrome ? svgoMonochrome : svgo).optimize(svgContent, result => {
      resolve(result.data);
    });
  });
};

module.exports = optimizeAsync;
