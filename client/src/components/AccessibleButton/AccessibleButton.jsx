import React from 'react';
import PropTypes from 'prop-types';

export default function AccessibleButton({
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

AccessibleButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
