import * as React from 'react';
import * as PropTypes from 'prop-types';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: string;
  width?: string;
  height?: string;
  fill?: string;
}

/*tslint:disable*/
const Icon: React.SFC<IconProps> = ({children, size, width, height, ...props}) => (
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

export default Icon;
/*tslint:enable*/
