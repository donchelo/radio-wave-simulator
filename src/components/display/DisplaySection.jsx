import React from 'react';
import WaveDisplay from './WaveDisplay';
import WaveModeSelector from './WaveModeSelector';
import TextToLetterWave from '../text-to-wave/TextToLetterWave';
import ThemeSelector from '../ThemeSelector';

const DisplaySection = ({ 
  waveParams, 
  svgRef, 
  svgDimensions, 
  getBaseColor, 
  updateParam,
  handleWaveModeToggle,
  handleTextWaveGenerated
}) => {
  const { 
    powerOn, 
    textWaveMode, 
    displayTheme, 
    waveform
  } = waveParams;

  // Obtener el nombre del tipo de onda
  const getWaveformName = () => {
    const waveformIndex = Math.floor(waveform * 4);
    switch(waveformIndex) {
      case 1: return "SQUARE";
      case 2: return "TRIANGLE";
      case 3: return "SAWTOOTH";
      default: return "SINE";
    }
  };

  return (
    <div className="wave-display-section">
      <WaveDisplay 
        waveParams={waveParams}
        getBaseColor={getBaseColor}
        svgRef={svgRef}
        svgDimensions={svgDimensions}
      />
      
      {/* Indicador de modo de onda */}
      <div className="wave-mode-indicator">
        {powerOn && (
          <span className="mode-text">
            {textWaveMode ? "TEXT WAVE" : getWaveformName() + " WAVE"}
          </span>
        )}
      </div>
      
      {/* Controles de visualización */}
      <div className="display-controls">
        <WaveModeSelector
          textWaveMode={textWaveMode}
          powerOn={powerOn}
          onToggle={handleWaveModeToggle}
        />
        
        <ThemeSelector 
          theme={displayTheme}
          powerOn={powerOn}
          updateParam={updateParam}
        />
      </div>
      
      {/* Entrada de texto cuando está en modo texto */}
      {textWaveMode && (
        <div className="text-input-area">
          <TextToLetterWave 
            waveParams={waveParams}
            onTextWaveGenerated={handleTextWaveGenerated}
            powerOn={powerOn}
            width={svgDimensions.width}
            height={svgDimensions.height}
          />
        </div>
      )}
    </div>
  );
};

export default DisplaySection;