import * as React from 'react';
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
  size: React.PropTypes.string,
  width: React.PropTypes.string,
  height: React.PropTypes.string,
  children: React.PropTypes.any,
  viewBox: React.PropTypes.string.isRequired
};

export default Icon;
