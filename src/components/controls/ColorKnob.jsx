import React from 'react';
import VintageKnob from './VintageKnob';
import './ColorKnob.css';

const ColorKnob = ({ value, onChange, label, min, max, disabled }) => {
  // Calculate hue based on value
  const hue = (value / max) * 360;
  
  return (
    <div className="color-knob-container">
      <VintageKnob
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        size={70}
        label={label}
        disabled={disabled}
      />
      <div 
        className="color-preview" 
        style={{ backgroundColor: `hsl(${hue}, 80%, 50%)` }}
      ></div>
    </div>
  );
};

export default ColorKnob;