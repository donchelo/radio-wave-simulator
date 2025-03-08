import React from 'react';
import VintageKnob from '../components/controls/VintageKnob';
import ToggleKnob from '../components/controls/VintageKnob';

const ControlPanel = ({ waveParams, setters }) => {
  const { 
    amplitude, 
    frequency, 
    phase, 
    waveCount, 
    hue, 
    saturation, 
    waveform, 
    distortion, 
    harmonics, 
    modulation, 
    tremolo, 
    powerOn 
  } = waveParams;

  const { 
    setAmplitude, 
    setFrequency, 
    setPhase, 
    setWaveCount, 
    setHue, 
    setSaturation, 
    setDistortion, 
    setHarmonics, 
    setModulation, 
    setTremolo, 
    setWaveform, 
    handlePowerToggle 
  } = setters;

  return (
    <div className="control-section">
      <div className="radio-name">
        <span>WAVE SIMULATOR</span>
      </div>
      
      {/* Filas de perillas con grid layout para alineación uniforme */}
      <div className="knobs-grid">
        <div className="knob-cell">
          <VintageKnob 
            value={amplitude} 
            min={10} 
            max={150} 
            onChange={setAmplitude} 
            size={70}
            label="AMPLITUDE"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={frequency} 
            min={0.5} 
            max={5} 
            onChange={setFrequency} 
            size={70}
            label="FREQUENCY"
            disabled={!powerOn}
          />
        </div>

        <div className="knob-cell">
          <ToggleKnob 
            value={Math.floor(waveform * 4)} 
            options={['SINE', 'SQUARE', 'TRIANGLE', 'SAW']}
            onChange={(val) => setWaveform(val / 3)} 
            size={70}
            label="WAVEFORM"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={distortion} 
            min={0} 
            max={1} 
            onChange={setDistortion} 
            size={70}
            label="DISTORTION"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={waveCount} 
            min={1} 
            max={8} 
            onChange={(val) => setWaveCount(Math.floor(val))} 
            size={70}
            label="LAYERS"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={harmonics} 
            min={0} 
            max={1} 
            onChange={setHarmonics} 
            size={70}
            label="HARMONICS"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={hue} 
            min={0} 
            max={359} 
            onChange={setHue} 
            size={70}
            label="HUE"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={saturation} 
            min={0} 
            max={100} 
            onChange={setSaturation} 
            size={70}
            label="SATURATION"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={tremolo} 
            min={0} 
            max={1} 
            onChange={setTremolo} 
            size={70}
            label="TREMOLO"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={modulation} 
            min={0} 
            max={1} 
            onChange={setModulation} 
            size={70}
            label="MODULATION"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <VintageKnob 
            value={phase} 
            min={0} 
            max={6.28} 
            onChange={setPhase} 
            size={70}
            label="PHASE"
            disabled={!powerOn}
          />
        </div>
        
        <div className="knob-cell">
          <ToggleKnob 
            value={powerOn ? 1 : 0} 
            options={['OFF', 'ON']}
            onChange={handlePowerToggle} 
            size={70}
            label="POWER"
            highlight={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;