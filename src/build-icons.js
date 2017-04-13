const fs = require('fs-extra');
const co = require('co');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');
const esformatter = require('esformatter');
const forEach = require('lodash.foreach');
const camelCase = require('lodash.camelcase');
const optimizeSVG = require('./svg-optimizer');
const slash = require('slash');
esformatter.register(require('esformatter-jsx'));

let components = {};
let createReactComponents = null;
const componentsDirName = 'components';

const run = (inputDir, outputDir, isTypeScriptOutput) => {
  components = {};
  return new Promise(resolve => {
    glob(`${inputDir}/**/*.svg`, co.wrap(function* (err, icons) {
      if (err) {
        console.error(err);
        return;
      }

      cleanPrevious(outputDir);
      yield Promise.all(icons.map(icon => createReactComponents(icon, outputDir, isTypeScriptOutput)));

      createIndexFile(outputDir, isTypeScriptOutput);
      copyIconBase(outputDir, isTypeScriptOutput);
      resolve();
    }));
  });
};

module.exports = run;

const componentsDir = outputDir => path.join(outputDir, componentsDirName);
function cleanPrevious(outputDir) {
  fs.removeSync(outputDir);
  fs.mkdirsSync(outputDir);
  fs.mkdirsSync(componentsDir(outputDir));
}

const resetIfNotNone = val => val === 'none' ? 'none' : 'currentColor';
const attributesToRename = {'xlink:href': 'xlinkHref', class: 'className'};
const attributesToReplace = {fill: resetIfNotNone, stroke: resetIfNotNone};

function toReactAttributes($el, $) {
  forEach($el.attr(), (val, name) => {
    if (attributesToReplace[name]) {
      $el.attr(name, attributesToReplace[name](val));
    }

    if (name.indexOf('-') === -1 && !attributesToRename[name]) {
      return;
    }

    const newName = attributesToRename[name] || camelCase(name);
    $el.attr(newName, val).removeAttr(name);
  });

  if ($el.children().length === 0) {
    return false;
  }

  $el.children().each((index, el) => {
    const $child = $(el);
    toReactAttributes($child, $);
  });
}

createReactComponents = co.wrap(function* (svgPath, outputDir, isTypeScriptOutput) {
  const name = path.basename(svgPath, '.svg');
  const location = slash(path.join(componentsDirName, name + (isTypeScriptOutput ? '.tsx' : '.js')));
  try {
    let svg = fs.readFileSync(svgPath, 'utf-8');
    svg = yield optimizeSVG(svg);
    const component = createReactSVG(name, svg, isTypeScriptOutput);

    components[name] = location;

    fs.writeFileSync(slash(path.join(outputDir, location), component, 'utf-8'));
    console.log(`created: ${path.join('.', location)}`);
  } catch (err) {
    console.error(`failed to create svg file for ${name}; Error: ${err}`);
  }
});

function createReactSVG(name, svg, isTypeScriptOutput) {
  const $ = cheerio.load(svg, {
    xmlMode: true
  });
  const $svg = $('svg');
  toReactAttributes($svg, $);
  const iconSvg = $svg.html();
  const viewBox = $svg.attr('viewBox');

  const uglyComponent = (isTypeScriptOutput ? `import * as React from 'react';` : `import React from 'react';`) +
     `
import Icon from '../Icon';

/*eslint-disable */
const ${name} = props => (
  <Icon viewBox="${viewBox}" {...props}>
    <g>${iconSvg}</g>
  </Icon>
);
/*eslint-enable */

export default ${name};
`;

  return esformatter.format(uglyComponent);
}

function createIndexFile(outputDir, isTypeScriptOutput) {
  const suffix = isTypeScriptOutput ? '.ts' : '.js';
  const iconsModule = Object.keys(components).map(name => {
    const loc = `./${components[name].replace(/\.tsx|\.js/, '')}`;
    return `export {default as ${name}} from '${loc}';`;
  }).join('\n') + '\n';
  fs.writeFileSync(path.join(outputDir, 'index' + suffix), iconsModule, 'utf-8');
  console.log(path.join('.', 'index' + suffix));
}

function copyIconBase(outputDir, isTypeScriptOutput) {
  const suffix = isTypeScriptOutput ? '.tsx' : '.js';
  fs.copySync(path.resolve(__dirname, './icon-base/Icon' + suffix), path.join(outputDir, 'Icon' + suffix));
  fs.copySync(path.resolve(__dirname, './icon-base/Icon.scss'), path.join(outputDir, 'Icon.scss'));
}
