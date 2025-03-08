import React from 'react';
import ToggleKnob from '../controls/ToggleKnob';

const WaveModeSelector = ({ textWaveMode, powerOn, onToggle }) => {
  return (
    <div className="wave-mode-selector">
      <ToggleKnob 
        value={textWaveMode ? 1 : 0} 
        options={['AUTO', 'TEXT']}
        onChange={onToggle} 
        size={60}
        label="WAVE SOURCE"
        disabled={!powerOn}
      />
    </div>
  );
};

export default WaveModeSelector;