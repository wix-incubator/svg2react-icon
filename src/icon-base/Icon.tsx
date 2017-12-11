import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as s from './Icon.scss';

const Icon: any = (p: any) => (
  <svg
    id={p.id}
    className={`${s.iconDefault} ${p.className}`}
    width={p.width || p.size}
    height={p.height || p.size}
    viewBox={p.viewBox}
    >
    {p.children}
  </svg>
);

Icon.defaultProps = {
  size: '1em'
};

Icon.propTypes = {
  classname: PropTypes.string,
  id: PropTypes.string,
  size: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.any,
  viewBox: PropTypes.string.isRequired
};

export default Icon;
