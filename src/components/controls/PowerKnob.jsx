import React from 'react';
import './PowerKnob.css';

const PowerKnob = ({ value, onChange, size = 90, label }) => {
  const handleToggle = () => {
    onChange(value === 1 ? 0 : 1);
  };

  const isOn = value === 1;

  return (
    <div className="power-knob-container">
      <button 
        className={`power-knob ${isOn ? 'power-on' : 'power-off'}`}
        onClick={handleToggle}
        style={{ width: size, height: size }}
      >
        <div className="power-knob-indicator">
          <div className="power-icon"></div>
        </div>
      </button>
      <div className="power-knob-label">{label}</div>
      <div className={`power-knob-status ${isOn ? 'on' : 'off'}`}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  );
};

export default PowerKnob;