import React from 'react';

const KnobRow = ({ children }) => {
  return (
    <div className="knobs-row">
      {React.Children.map(children, (child) => (
        <div className="knob-unit">
          {child}
        </div>
      ))}
    </div>
  );
};

export default KnobRow;