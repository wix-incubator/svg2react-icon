const cheerio = require('cheerio');
const forEach = require('lodash.foreach');
const camelCase = require('lodash.camelcase');
const esformatter = require('esformatter');
esformatter.register(require('esformatter-jsx'));

module.exports = (name, svg, isTypeScriptOutput, attributeStrip) => {
  const $ = cheerio.load(svg, {
    xmlMode: true
  });
  const $svg = $('svg');
  toReactAttributes($svg, $, attributeStrip);
  const children = $svg.html();
  const viewBox = $svg.attr('viewBox');
  const iconJsx = `<Icon viewBox="${viewBox}" {...props}>${children}</Icon>`;
  const code = isTypeScriptOutput ?
    `
      import * as React from 'react';
      import Icon, {IconProps} from '../Icon';
      const ${name}: React.SFC<IconProps> = props => (
        ${iconJsx}
      );
      export default ${name};
    ` :
    `
      import React from 'react';
      import Icon from '../Icon';
      const ${name} = props => (
        ${iconJsx}
      );
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
};

const resetIfNotNone = val => val === 'none' ? 'none' : 'currentColor';
const attributesToRename = {'xlink:href': 'xlinkHref', class: 'className'};
const attributesToReplace = {fill: resetIfNotNone, stroke: resetIfNotNone};

function toReactAttributes($el, $, attributeStrip) {
  forEach($el.attr(), (val, name) => {
    if (attributeStrip && attributesToReplace[name]) {
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
    toReactAttributes($child, $, attributeStrip);
  });
}
