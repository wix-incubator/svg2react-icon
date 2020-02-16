const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const svgToComponent = require('./lib/svg2component');
const optimizeSvg = require('./lib/svg-optimizer');

module.exports = ({inputDir, outputDir, typescript, monochrome, namedExport, keepColors}) => {
  if (!inputDir || !outputDir) {
    throw new Error('Input and output dirs not specified');
  }
  const icons = glob.sync(`${inputDir}/**/*.svg`);
  return processIcons(icons, outputDir, {isTypeScriptOutput: typescript, monochrome, namedExport, keepColors});
};

async function processIcons(filenames, outputDir, options) {
  fs.removeSync(outputDir);
  fs.mkdirsSync(outputDir);

  const componentNames = await Promise.all(
    filenames.map(icon => processIcon(icon, outputDir, options))
  );

  createIndexFile(componentNames, outputDir, options);
}

async function processIcon(svgPath, outputDir, options) {
  const name = path.basename(svgPath, '.svg');
  const filename = name + (options.isTypeScriptOutput ? '.tsx' : '.js');
  const absolutePath = path.join(outputDir, filename);

  try {
    const svg = fs.readFileSync(svgPath, 'utf-8');
    const optimizedSvg = await optimizeSvg(svg, options.monochrome);
    const componentCode = svgToComponent(name, optimizedSvg, options);
    fs.writeFileSync(absolutePath, componentCode, 'utf-8');
    console.log(`Created: ${filename}`);
  } catch (err) {
    console.error(`Failed to generate component ${name}. Error: ${err}`);
  }

  return name;
}

function createIndexFile(componentNames, outputDir, options) {
  const code = componentNames.length ? [
    '/* eslint-disable */',
    '/* tslint:disable */',
    componentNames.map(name =>
      `export {${options.namedExport ? '' : 'default as '}${name}} from './${name}';`
    ).join('\n'),
    '/* tslint:enable */',
    '/* eslint-enable */',
    ''
  ].join('\n') : '\n';

  const filename = 'index' + (options.isTypeScriptOutput ? '.ts' : '.js');
  fs.writeFileSync(path.join(outputDir, filename), code, 'utf-8');
  console.log(`Created: ${filename}`);
}
