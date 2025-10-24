import React from 'react';
import PropTypes from 'prop-types';

export default function AccordionPanel({ id, open, children }) {
  return (
    <div
      id={id}
      role="region"
      aria-hidden={!open}
      className="bg-linear-to-br from-gray-800/20 to-gray-900/20"
    >
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

AccordionPanel.propTypes = {
  id: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  children: PropTypes.node,
};
