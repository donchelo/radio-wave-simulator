import React from 'react';
import ToggleKnob from '../controls/ToggleKnob';
import './WaveModeSelector.css';

const WaveModeSelector = ({ textWaveMode, powerOn, onToggle }) => {
  return (
    <div className="wave-mode-selector">
      <div className="wave-mode-label">WAVE MODE</div>
      <div className="mode-toggle-container">
        <div className={`mode-indicator ${!textWaveMode ? 'active' : ''}`}>AUTO</div>
        <div className="toggle-switch">
          <input 
            type="checkbox" 
            id="mode-toggle" 
            className="toggle-checkbox"
            checked={textWaveMode}
            onChange={(e) => onToggle(e.target.checked ? 1 : 0)}
            disabled={!powerOn}
          />
          <label 
            htmlFor="mode-toggle" 
            className={`toggle-label ${!powerOn ? 'disabled' : ''}`}
          ></label>
        </div>
        <div className={`mode-indicator ${textWaveMode ? 'active' : ''}`}>TEXT</div>
      </div>
    </div>
  );
};

export default WaveModeSelector;