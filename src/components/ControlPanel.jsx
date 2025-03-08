import React from 'react';
import VintageKnob from './controls/VintageKnob';
import ToggleKnob from './controls/ToggleKnob';
import PowerKnob from './controls/PowerKnob';

// Función auxiliar para crear secciones de controles
const ControlSection = ({ title, children }) => (
  <div className="control-section">
    <h3 className="section-title">{title}</h3>
    <div className="section-controls">
      {children}
    </div>
  </div>
);

const ControlPanel = ({ waveParams, updateParam, handlePowerToggle }) => {
  const { 
    amplitude, frequency, phase, waveCount, hue, saturation, 
    waveform, distortion, harmonics, modulation, tremolo, 
    powerOn, showScanline, showPersistence,
    // Nuevos parámetros
    brightness, noise, glitch, speed, echo
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
    <div className="knobs-section">
      {/* Primera fila: Parámetros principales de la onda */}
      <div className="knobs-row primary-controls">
        <div className="knob-unit">
          <VintageKnob 
            value={amplitude} 
            min={10} 
            max={150} 
            onChange={(val) => updateParam('amplitude', val)} 
            size={70}
            label="AMPLITUDE"
            disabled={!powerOn}
          />
          <div className="knob-value">{amplitude.toFixed(0)}</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={frequency} 
            min={0.5} 
            max={5} 
            onChange={(val) => updateParam('frequency', val)} 
            size={70}
            label="FREQUENCY"
            disabled={!powerOn}
          />
          <div className="knob-value">{frequency.toFixed(2)}</div>
        </div>
        
        <div className="knob-unit">
          <ToggleKnob 
            value={Math.floor(waveform * 4)} 
            options={['SINE', 'SQUARE', 'TRIANGLE', 'SAW']}
            onChange={(val) => updateParam('waveform', val / 3)} 
            size={70}
            label="WAVEFORM"
            disabled={!powerOn}
          />
          <div className="knob-value">{getWaveformName()}</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={waveCount} 
            min={1} 
            max={8} 
            onChange={(val) => updateParam('waveCount', Math.floor(val))} 
            size={70}
            label="LAYERS"
            disabled={!powerOn}
          />
          <div className="knob-value">{waveCount}</div>
        </div>
      </div>
      
      {/* Segunda fila: Efectos de onda */}
      <div className="knobs-row">
        <div className="knob-unit">
          <VintageKnob 
            value={distortion} 
            min={0} 
            max={1} 
            onChange={(val) => updateParam('distortion', val)} 
            size={70}
            label="DISTORTION"
            disabled={!powerOn}
          />
          <div className="knob-value">{distortion.toFixed(2)}</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={harmonics} 
            min={0} 
            max={1} 
            onChange={(val) => updateParam('harmonics', val)} 
            size={70}
            label="HARMONICS"
            disabled={!powerOn}
          />
          <div className="knob-value">{harmonics.toFixed(2)}</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={tremolo} 
            min={0} 
            max={1} 
            onChange={(val) => updateParam('tremolo', val)} 
            size={70}
            label="TREMOLO"
            disabled={!powerOn}
          />
          <div className="knob-value">{tremolo.toFixed(2)}</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={modulation} 
            min={0} 
            max={1} 
            onChange={(val) => updateParam('modulation', val)} 
            size={70}
            label="MODULATION"
            disabled={!powerOn}
          />
          <div className="knob-value">{modulation.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Tercera fila: Nuevos efectos visuales - primera parte */}
      <div className="knobs-row">
        <div className="knob-unit">
          <VintageKnob 
            value={brightness} 
            min={10} 
            max={200} 
            onChange={(val) => updateParam('brightness', val)} 
            size={70}
            label="BRIGHTNESS"
            disabled={!powerOn}
          />
          <div className="knob-value">{brightness.toFixed(0)}%</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={noise} 
            min={0} 
            max={100} 
            onChange={(val) => updateParam('noise', val)} 
            size={70}
            label="NOISE"
            disabled={!powerOn}
          />
          <div className="knob-value">{noise.toFixed(0)}%</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={glitch} 
            min={0} 
            max={100} 
            onChange={(val) => updateParam('glitch', val)} 
            size={70}
            label="GLITCH"
            disabled={!powerOn}
          />
          <div className="knob-value">{glitch.toFixed(0)}%</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={echo} 
            min={0} 
            max={100} 
            onChange={(val) => updateParam('echo', val)} 
            size={70}
            label="ECHO"
            disabled={!powerOn}
          />
          <div className="knob-value">{echo.toFixed(0)}%</div>
        </div>
      </div>
      
      {/* Cuarta fila: Ajustes adicionales y controles de pantalla */}
      <div className="knobs-row">
        <div className="knob-unit">
          <VintageKnob 
            value={speed} 
            min={0.1} 
            max={5} 
            onChange={(val) => updateParam('speed', val)} 
            size={70}
            label="SPEED"
            disabled={!powerOn}
          />
          <div className="knob-value">{speed.toFixed(1)}x</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={phase} 
            min={0} 
            max={6.28} 
            onChange={(val) => updateParam('phase', val)} 
            size={70}
            label="PHASE"
            disabled={!powerOn}
          />
          <div className="knob-value">{phase.toFixed(2)}</div>
        </div>
        
        <div className="knob-unit">
          <VintageKnob 
            value={saturation} 
            min={0} 
            max={100} 
            onChange={(val) => updateParam('saturation', val)} 
            size={70}
            label="SATURATION"
            disabled={!powerOn}
          />
          <div className="knob-value">{saturation.toFixed(0)}</div>
        </div>
        
        <div className="effect-controls">
          <button 
            className={`effect-button ${showScanline ? 'active' : ''}`}
            onClick={() => updateParam('showScanline', !showScanline)}
            disabled={!powerOn}
          >
            SCAN
          </button>
          <button 
            className={`effect-button ${showPersistence ? 'active' : ''}`}
            onClick={() => updateParam('showPersistence', !showPersistence)}
            disabled={!powerOn}
          >
            PERSIST
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;