import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as s from './Icon.scss';

const Icon: any = ({children, viewBox, size, width, height}) => (
  <svg
    className={s.iconDefault}
    width={width || size}
    height={height || size}
    viewBox={viewBox}
    >
    {children}
  </svg>
);

Icon.defaultProps = {
  size: '1em'
};

Icon.propTypes = {
  size: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.any,
  viewBox: PropTypes.string.isRequired
};

export default Icon;
