import React from 'react';

const WaveInfo = ({ waveParams }) => {
  const { textWaveMode, waveform, colorMode } = waveParams;
  
  // Get waveform name for display
  const getWaveformName = () => {
    if (textWaveMode) return "TEXT WAVE";
    
    const waveformIndex = Math.floor(waveform * 4);
    switch(waveformIndex) {
      case 1: return "SQUARE WAVE";
      case 2: return "TRIANGLE WAVE";
      case 3: return "SAWTOOTH WAVE";
      default: return "SINE WAVE";
    }
  };
  
  return (
    <div className="wave-info">
      <span className="wave-type">{getWaveformName()}</span>
      {colorMode === 'rainbow' && <span className="color-mode">RAINBOW</span>}
    </div>
  );
};

export default WaveInfo;