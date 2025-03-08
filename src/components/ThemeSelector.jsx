import React from 'react';

const ThemeSelector = ({ theme, powerOn, updateParam }) => {
  return (
    <div className="theme-controls">
      <div className="theme-buttons">
        <button 
          className={`theme-button green ${theme === 'green' ? 'active' : ''}`}
          onClick={() => updateParam('hue', 120)}
          disabled={!powerOn}
          title="Green Theme"
        ></button>
        <button 
          className={`theme-button amber ${theme === 'amber' ? 'active' : ''}`}
          onClick={() => updateParam('hue', 30)}
          disabled={!powerOn}
          title="Amber Theme"
        ></button>
        <button 
          className={`theme-button blue ${theme === 'blue' ? 'active' : ''}`}
          onClick={() => updateParam('hue', 210)}
          disabled={!powerOn}
          title="Blue Theme"
        ></button>
      </div>
    </div>
  );
};

export default ThemeSelector;