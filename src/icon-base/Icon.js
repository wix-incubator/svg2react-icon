import React from 'react';
import PropTypes from 'prop-types';
import s from './Icon.scss';

const Icon = ({id, children, viewBox, size, width, height, className}) => (
  <svg
    id={id}
    className={`${s.iconDefault} ${className}`}
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
  className: PropTypes.string,
  id: PropTypes.string,
  size: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.any,
  viewBox: PropTypes.string.isRequired
};

export default Icon;
