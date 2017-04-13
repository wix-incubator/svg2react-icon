const fs = require('fs-extra');
const co = require('co');
const path = require('path');
const glob = require('glob');
const svg2Component = require('./lib/svg2component');

const componentsDirName = 'components';
const processIcons = co.wrap(processIconsGenerator);
const processIcon = co.wrap(processIconGenerator);

module.exports = (inputDir, outputDir, isTypeScriptOutput) => {
  const buildIconsAsync = resolve => {
    glob(`${inputDir}/**/*.svg`, co.wrap(function* (err, icons) {
      if (err) {
        console.error(err);
        return;
      }

      yield processIcons(icons, outputDir, isTypeScriptOutput);
      resolve();
    }));
  };

  return new Promise(buildIconsAsync);
};

function* processIconsGenerator(icons, outputDir, isTypeScriptOutput) {
  cleanPrevious(outputDir);
  const iconProcessors = icons.map(icon => processIcon(icon, outputDir, isTypeScriptOutput));
  const components = yield Promise.all(iconProcessors);

  createIndexFile(components, outputDir, isTypeScriptOutput);
  copyIconBase(outputDir, isTypeScriptOutput);
}

function* processIconGenerator(svgPath, outputDir, isTypeScriptOutput) {
  const component = {};
  component.name = path.basename(svgPath, '.svg');
  component.path = path.join(componentsDirName, component.name + (isTypeScriptOutput ? '.tsx' : '.js'));
  try {
    const svg = fs.readFileSync(svgPath, 'utf-8');
    component.raw = yield svg2Component(svg, component.name, isTypeScriptOutput);
    fs.writeFileSync(path.join(outputDir, component.path), component.raw, 'utf-8');
    console.log(`created: ${path.join('.', component.path)}`);
  } catch (err) {
    console.error(`failed to create svg file for ${component.name}; Error: ${err}`);
  }

  return component;
}

const componentsDir = outputDir => path.join(outputDir, componentsDirName);
function cleanPrevious(outputDir) {
  fs.removeSync(outputDir);
  fs.mkdirsSync(outputDir);
  fs.mkdirsSync(componentsDir(outputDir));
}

function createIndexFile(components, outputDir, isTypeScriptOutput) {
  const suffix = isTypeScriptOutput ? '.ts' : '.js';
  const iconsModule = components.map(component => {
    const loc = `./${component.path.replace(/\.tsx|\.js/, '')}`;
    return `export {default as ${component.name}} from '${loc}';`;
  }).join('\n') + '\n';

  fs.writeFileSync(path.join(outputDir, 'index' + suffix), iconsModule, 'utf-8');
  console.log(path.join('.', 'index' + suffix));
}

function copyIconBase(outputDir, isTypeScriptOutput) {
  const suffix = isTypeScriptOutput ? '.tsx' : '.js';
  fs.copySync(path.resolve(__dirname, './icon-base/Icon' + suffix), path.join(outputDir, 'Icon' + suffix));
  fs.copySync(path.resolve(__dirname, './icon-base/Icon.scss'), path.join(outputDir, 'Icon.scss'));
}
