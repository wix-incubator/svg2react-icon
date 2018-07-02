const cheerio = require('cheerio');
const forEach = require('lodash.foreach');
const camelCase = require('lodash.camelcase');
const esformatter = require('esformatter');
esformatter.register(require('esformatter-jsx'));

module.exports = (name, svg, isTypeScriptOutput) => {
  const $ = cheerio.load(svg, {
    xmlMode: true
  });
  const $svg = $('svg');
  toReactAttributes($svg, $);
  const children = $svg.html();
  const viewBox = $svg.attr('viewBox') ? `viewBox="${$svg.attr('viewBox')}"` : '';
  const widthFromSvg = $svg.attr('width') || '1em';
  const heightFromSvg = $svg.attr('height') || '1em';
  const code = isTypeScriptOutput ?
    `
      import * as React from 'react';
      export interface ${name}Props extends React.SVGAttributes<SVGElement> {
        size?: string;
      }
      const ${name}: React.SFC<${name}Props> = ({size, ...props}) => (
        <svg
          ${viewBox}
          fill="currentColor"
          width={size || "${widthFromSvg}"}
          height={size || "${heightFromSvg}"}
          {...props}
        >
          ${children}
        </svg>
      );
      ${name}.displayName = '${name}';
      export default ${name};
    ` :
    `
      import PropTypes from 'prop-types';
      import React from 'react';
      const ${name} = ({size, ...props}) => (
        <svg
          ${viewBox}
          fill="currentColor"
          width={size || "${widthFromSvg}"}
          height={size || "${heightFromSvg}"}
          {...props}
        >
          ${children}
        </svg>
      );
      ${name}.displayName = '${name}';
      ${name}.propTypes = {
        size: PropTypes.string
      }
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
