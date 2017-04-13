const co = require('co');
const cheerio = require('cheerio');
const forEach = require('lodash.foreach');
const camelCase = require('lodash.camelcase');
const esformatter = require('esformatter');
const optimizeSVG = require('./svg-optimizer');
esformatter.register(require('esformatter-jsx'));

module.exports = co.wrap(svg2ComponentGenerator);

function* svg2ComponentGenerator(svg, name, isTypeScriptOutput) {
  const optimisedSvg = yield optimizeSVG(svg);
  return createReactSVG(name, optimisedSvg, isTypeScriptOutput);
}

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
