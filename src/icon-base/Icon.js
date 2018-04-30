import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({children, size, width, height, ...props}) => (
  <svg
    {...props}
    width={width || size}
    height={height || size}
  >
    {children}
  </svg>
);

Icon.defaultProps = {
  size: '1em',
  fill: 'currentColor'
};

Icon.propTypes = {
  size: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.node,
  viewBox: PropTypes.string.isRequired
};

export default Icon;
