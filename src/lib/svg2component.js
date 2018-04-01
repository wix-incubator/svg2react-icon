const co = require('co');
const cheerio = require('cheerio');
const forEach = require('lodash.foreach');
const camelCase = require('lodash.camelcase');
const esformatter = require('esformatter');
const optimizeSVG = require('./svg-optimizer');
esformatter.register(require('esformatter-jsx'));

module.exports = co.wrap(svg2ComponentGenerator);

function* svg2ComponentGenerator(svg, name, isTypeScriptOutput, monochrome) {
  const optimisedSvg = yield optimizeSVG(svg, monochrome);
  return createReactSVG(name, optimisedSvg, isTypeScriptOutput);
}

function createReactSVG(name, svg, isTypeScriptOutput) {
  const $ = cheerio.load(svg, {
    xmlMode: true
  });
  const $svg = $('svg');
  toReactAttributes($svg, $);
  const children = $svg.html();
  const viewBox = $svg.attr('viewBox');
  const svgJsx = `<Icon viewBox="${viewBox}" {...props}>${children}</Icon>`;
  const code = isTypeScriptOutput ?
    `
      import * as React from 'react';
      import Icon, {IconProps} from '../Icon';
      const ${name}: React.SFC<IconProps> = props => ${svgJsx};
      export default ${name};
    ` :
    `
      import React from 'react';
      import Icon from '../Icon';
      const ${$name} = props => ${svgJsx};
      export default ${name};
    `;

  return [
    '/* eslint-disable */',
    '/* tslint:disable */',
    esformatter.format(code).trim(),
    '/* tslint:enable */',
    '/* eslint-enable */',
    ''
  ].join('\n');
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
