import React from 'react';
import './WaveModeSelector.css';

const WaveModeSelector = ({ textWaveMode, powerOn }) => {
  return (
    <div className="wave-mode-selector">
      <div className="waveform-display">
        <div className={`waveform-text ${!powerOn ? 'disabled' : ''}`}>
          {powerOn ? (textWaveMode ? 'TEXT WAVE' : 'SINE WAVE') : 'STANDBY'}
        </div>
      </div>
    </div>
  );
};

export default WaveModeSelector;