import React from 'react';
import VintageKnob from './controls/VintageKnob';
import ToggleKnob from './controls/ToggleKnob';
import ColorKnob from './controls/ColorKnob';
import ColorThemeSelector from './controls/ColorThemeSelector';

// Reusable components for layout structure
const ControlSection = ({ title, children }) => (
  <div className="control-section">
    <h3 className="section-title">{title}</h3>
    <div className="section-content">{children}</div>
  </div>
);

const KnobRow = ({ children }) => <div className="knobs-row">{children}</div>;

// Enhanced KnobUnit component with smarter value formatting
const KnobUnit = ({ label, value, unit = '', children }) => {
  const formattedValue = typeof value === 'number' 
    ? (Number.isInteger(value) ? value.toString() : value.toFixed(2))
    : value;
  
  return (
    <div className="knob-unit">
      {children}
      <div className="knob-value">{formattedValue}{unit}</div>
    </div>
  );
};

// Main ControlPanel component
const ControlPanel = ({ waveParams, updateParam }) => {
  const { powerOn } = waveParams;

  // Maps parameter names to their configuration
  const knobConfigs = {
    // Wave Parameters
    amplitude: { min: 10, max: 150, label: "AMPLITUDE" },
    frequency: { min: 0.5, max: 5, label: "FREQUENCY" },
    phase: { min: 0, max: 6.28, label: "PHASE" },
    
    // Modulation Effects
    distortion: { min: 0, max: 1, label: "DISTORTION" },
    harmonics: { min: 0, max: 1, label: "HARMONICS" },
    tremolo: { min: 0, max: 1, label: "TREMOLO" },
    modulation: { min: 0, max: 1, label: "MODULATION" },
    
    // Color Settings
    hue: { min: 0, max: 359, label: "HUE", component: ColorKnob },
    saturation: { min: 0, max: 100, label: "SATURATION" },
    colorSpread: { min: 0, max: 30, label: "COLOR SPREAD", component: ColorKnob, defaultValue: 10 },
    glow: { min: 0, max: 100, label: "GLOW", unit: "%", defaultValue: 0 },
    brightness: { min: 10, max: 200, label: "BRIGHTNESS", unit: "%", defaultValue: 100 },
    background: { min: 0, max: 100, label: "BACKGROUND", unit: "%", defaultValue: 0 },
    
    // Special Effects
    noise: { min: 0, max: 100, label: "NOISE", unit: "%", defaultValue: 0 },
    glitch: { min: 0, max: 100, label: "GLITCH", unit: "%", defaultValue: 0 },
    echo: { min: 0, max: 100, label: "ECHO", unit: "%", defaultValue: 0 },
    afterglow: { min: 0, max: 100, label: "AFTERGLOW", unit: "%", defaultValue: 0 },
    
    // Display Settings
    waveCount: { min: 1, max: 8, label: "LAYERS", integer: true },
    speed: { min: 0.1, max: 5, label: "SPEED", unit: "x", defaultValue: 1.0 }
  };

  // Helper function to create a knob based on config
  const createKnob = (param) => {
    const config = knobConfigs[param];
    const value = waveParams[param] ?? config.defaultValue;
    const KnobComponent = config.component || VintageKnob;
    
    return (
      <KnobUnit 
        key={param} 
        label={config.label} 
        value={config.integer ? Math.floor(value) : value} 
        unit={config.unit || ''}
      >
        <KnobComponent
          value={value}
          min={config.min}
          max={config.max}
          onChange={(val) => updateParam(param, config.integer ? Math.floor(val) : val)}
          size={70}
          label={config.label}
          disabled={!powerOn}
        />
      </KnobUnit>
    );
  };

  // Functions for special knobs
  const getWaveformName = () => {
    const waveformIndex = Math.floor(waveParams.waveform * 4);
    const names = ["SINE", "SQUARE", "TRIANGLE", "SAWTOOTH"];
    return names[waveformIndex] || "SINE";
  };

  return (
    <div className="knobs-section">
      <ControlSection title="Wave Parameters">
        <KnobRow>
          {['amplitude', 'frequency', 'phase'].map(createKnob)}
          
          <KnobUnit label="WAVEFORM" value={getWaveformName()}>
            <ToggleKnob 
              value={Math.floor(waveParams.waveform * 4)} 
              options={['SINE', 'SQUARE', 'TRIANGLE', 'SAW']}
              onChange={(val) => updateParam('waveform', val / 3)} 
              size={70}
              label="WAVEFORM"
              disabled={!powerOn}
            />
          </KnobUnit>
        </KnobRow>
      </ControlSection>

      <ControlSection title="Modulation Effects">
        <KnobRow>
          {['distortion', 'harmonics', 'tremolo', 'modulation'].map(createKnob)}
        </KnobRow>
      </ControlSection>
      
      <ControlSection title="Color Settings">
        <KnobRow>
          {['hue', 'saturation', 'colorSpread'].map(createKnob)}
          
          <KnobUnit label="COLOR MODE" value={waveParams.colorMode || "theme"}>
            <ToggleKnob 
              value={waveParams.colorMode === "rainbow" ? 1 : 0} 
              options={['THEME', 'RAINBOW']}
              onChange={(val) => updateParam('colorMode', val === 0 ? 'theme' : 'rainbow')} 
              size={70}
              label="COLOR MODE"
              disabled={!powerOn}
            />
          </KnobUnit>
        </KnobRow>
        
        <KnobRow>
          {['glow', 'brightness', 'background'].map(createKnob)}
          
          <div className="knob-unit theme-selector-container">
            <ColorThemeSelector
              currentTheme={waveParams.displayTheme}
              onChange={(theme) => updateParam('displayTheme', theme)}
              disabled={!powerOn}
            />
          </div>
        </KnobRow>
      </ControlSection>
      
      <ControlSection title="Special Effects">
        <KnobRow>
          {['noise', 'glitch', 'echo', 'afterglow'].map(createKnob)}
        </KnobRow>
      </ControlSection>
      
      <ControlSection title="Display Settings">
        <KnobRow>
          {['waveCount', 'speed'].map(createKnob)}
        </KnobRow>
      </ControlSection>
    </div>
  );
};

export default ControlPanel;