const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const svgToComponent = require('./lib/svg2component');
const optimizeSvg = require('./lib/svg-optimizer');

const componentsDirName = 'components';

module.exports = ({inputDir, outputDir, typescript, monochrome, attributeStrip}) => {
  attributeStrip = attributeStrip === undefined ? true : attributeStrip;
  if (!inputDir || !outputDir) {
    throw new Error('Input and output dirs not specified');
  }
  const icons = glob.sync(`${inputDir}/**/*.svg`);
  return processIcons(icons, outputDir, typescript, monochrome, attributeStrip);
};

async function processIcons(filenames, outputDir, isTypeScriptOutput, monochrome, attributeStrip) {
  fs.removeSync(outputDir);
  fs.mkdirsSync(path.join(outputDir, componentsDirName));

  const componentNames = await Promise.all(
    filenames.map(icon => processIcon(icon, outputDir, isTypeScriptOutput, monochrome, attributeStrip))
  );

  createIndexFile(componentNames, outputDir, isTypeScriptOutput);
  copyIconBase(outputDir, isTypeScriptOutput);
}

async function processIcon(svgPath, outputDir, isTypeScriptOutput, monochrome, attributeStrip) {
  const name = path.basename(svgPath, '.svg');
  const filename = name + (isTypeScriptOutput ? '.tsx' : '.js');
  const relativePath = path.join(componentsDirName, filename);
  const absolutePath = path.join(outputDir, relativePath);

  try {
    const svg = fs.readFileSync(svgPath, 'utf-8');
    const optimizedSvg = await optimizeSvg(svg, monochrome, attributeStrip);
    const componentCode = svgToComponent(name, optimizedSvg, isTypeScriptOutput, attributeStrip);
    fs.writeFileSync(absolutePath, componentCode, 'utf-8');
    console.log(`Created: ${relativePath}`);
  } catch (err) {
    console.error(`Failed to generate component ${name}. Error: ${err}`);
  }

  return name;
}

function createIndexFile(componentNames, outputDir, isTypeScriptOutput) {
  const code = componentNames.map(name =>
    `export {default as ${name}} from './${componentsDirName}/${name}';`
  ).join('\n') + '\n';

  const filename = 'index' + (isTypeScriptOutput ? '.ts' : '.js');
  fs.writeFileSync(path.join(outputDir, filename), code, 'utf-8');
  console.log(`Created: ${filename}`);
}

function copyIconBase(outputDir, isTypeScriptOutput) {
  const filename = 'Icon' + (isTypeScriptOutput ? '.tsx' : '.js');
  fs.copySync(
    path.resolve(__dirname, 'icon-base', filename),
    path.join(outputDir, filename)
  );
  console.log(`Created: ${filename}`);
}
