const cheerio = require('cheerio');
const forEach = require('lodash.foreach');
const camelCase = require('lodash.camelcase');
const esformatter = require('esformatter');
esformatter.register(require('esformatter-jsx'));

module.exports = (name, svg, options) => {
  const $ = cheerio.load(svg, {
    xmlMode: true
  });
  const $svg = $('svg');
  const attributeConverter = createAttributeConverter(options);
  attributeConverter($svg, $);
  const children = $svg.html();
  const viewBox = $svg.attr('viewBox') ? `viewBox="${$svg.attr('viewBox')}"` : '';
  const widthFromSvg = $svg.attr('width') || '1em';
  const heightFromSvg = $svg.attr('height') || '1em';
  const code = options.isTypeScriptOutput ?
    `
      import * as React from 'react';
      export interface ${name}Props extends React.SVGAttributes<SVGElement> {
        size?: string;
      }
      ${options.namedExport ? 'export ' : ''}const ${name}: React.FunctionComponent<${name}Props> = ({size, ...props}) => (
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
      ${options.namedExport ? '' : `export default ${name};`}
    ` :
    `
      import PropTypes from 'prop-types';
      import React from 'react';
      ${options.namedExport ? 'export ' : ''}const ${name} = ({size, ...props}) => (
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
      ${options.namedExport ? '' : `export default ${name};`}
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

function createAttributeConverter(options) {
  const attributesToReplace = options.keepColors ? {} : {fill: resetIfNotNone, stroke: resetIfNotNone};
  const attributesToRename = {'xlink:href': 'xlinkHref', class: 'className'};

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

  return toReactAttributes;
}
