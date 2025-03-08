import React from 'react';
import VintageKnob from './controls/VintageKnob';
import ToggleKnob from './controls/ToggleKnob';
import PowerKnob from './controls/PowerKnob';

const ControlPanel = ({ waveParams, updateParam, handlePowerToggle }) => {
  const { 
    amplitude, frequency, phase, waveCount, hue, saturation, 
    waveform, distortion, harmonics, modulation, tremolo, 
    powerOn, showScanline, showPersistence
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
      {/* Primera fila de perillas */}
      <div className="knobs-row">
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
      
      {/* Segunda fila de perillas */}
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
      
      {/* Tercera fila: fase, saturación y efectos */}
      <div className="knobs-row">
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
          <div className="knob-value">{saturation.toString()}</div>
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