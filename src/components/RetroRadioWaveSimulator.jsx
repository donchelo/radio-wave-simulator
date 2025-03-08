import React, { useState, useEffect, useRef } from 'react';
import VintageKnob from './controls/VintageKnob';
import ToggleKnob from './controls/ToggleKnob';
import WaveDisplay from './display/WaveDisplay';
import WaveModeSelector from './display/WaveModeSelector';
import TextToLetterWave from './text-to-wave/TextToLetterWave';
import './RetroRadioWaveSimulator.css';

const RetroRadioWaveSimulator = () => {
  // Estados para controlar los parámetros de las ondas
  const [amplitude, setAmplitude] = useState(50);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const [waveCount, setWaveCount] = useState(3);
  const [hue, setHue] = useState(120); // Verde por defecto
  const [saturation, setSaturation] = useState(70);
  const [time, setTime] = useState(0);
  const [distortion, setDistortion] = useState(0);
  const [harmonics, setHarmonics] = useState(0);
  const [modulation, setModulation] = useState(0);
  const [tremolo, setTremolo] = useState(0);
  const [waveform, setWaveform] = useState(0); // 0: sine, 1: square, 2: triangle, 3: sawtooth
  const [powerOn, setPowerOn] = useState(true);
  const [textWaveData, setTextWaveData] = useState([]);
  const [textWaveMode, setTextWaveMode] = useState(false);
  const [displayTheme, setDisplayTheme] = useState('green'); // green, amber, blue
  
  // Dimensiones responsive del SVG
  const svgRef = useRef(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 250 });
  
  // Efectos especiales
  const [showScanline, setShowScanline] = useState(true);
  const [showPersistence, setShowPersistence] = useState(true);
  
  // Actualizar dimensiones al montar y en resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setSvgDimensions({ width, height: 250 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Animación - solo activa cuando está encendido
  useEffect(() => {
    let timer;
    if (powerOn) {
      timer = setInterval(() => {
        setTime(prevTime => (prevTime + 0.1) % 100);
      }, 50);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [powerOn]);
  
  // Cambiar tema con el cambio de hue
  useEffect(() => {
    // Asignar tema basado en el rango de hue
    if (hue >= 90 && hue < 150) {
      setDisplayTheme('green');
    } else if (hue >= 0 && hue < 60) {
      setDisplayTheme('amber');
    } else if (hue >= 180 && hue < 270) {
      setDisplayTheme('blue');
    }
  }, [hue]);
  
  // Manejador para el botón de encendido
  const handlePowerToggle = (value) => {
    setPowerOn(value === 1);
    
    // Efecto de apagado/encendido con delay
    if (value === 1) {
      // Simulación de encendido gradual
      setTimeout(() => {
        setShowScanline(true);
      }, 300);
    } else {
      setShowScanline(false);
    }
  };
  
  // Manejador para el botón de modo de onda
  const handleWaveModeToggle = (value) => {
    setTextWaveMode(value === 1);
  };
  
  // Manejador para datos de onda de texto
  const handleTextWaveGenerated = (waveData) => {
    setTextWaveData(waveData);
    
    if (waveData && waveData.length > 0) {
      setTextWaveMode(true);
    }
  };
  
  // Calcula el color base en formato HSL
  const getBaseColor = (waveIndex = 0) => {
    const waveHue = (hue + waveIndex * 10) % 360;
    return `hsl(${waveHue}, ${saturation}%, 70%)`;
  };
  
  // Manejar cambios de efectos visuales
  const toggleDisplayEffect = (effect) => {
    if (effect === 'scanline') {
      setShowScanline(prev => !prev);
    } else if (effect === 'persistence') {
      setShowPersistence(prev => !prev);
    }
  };
  
  // Agrupar parámetros de onda para pasarlos a los componentes hijos
  const waveParams = {
    amplitude,
    frequency,
    phase,
    waveCount,
    hue,
    saturation,
    time,
    distortion,
    harmonics,
    modulation,
    tremolo,
    waveform,
    powerOn,
    textWaveMode,
    textWaveData,
    svgDimensions,
    displayTheme,
    showScanline,
    showPersistence,
    handleWaveModeToggle
  };
  
  // Agrupar funciones de actualización
  const setterFunctions = {
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
    handlePowerToggle,
    handleWaveModeToggle,
    toggleDisplayEffect
  };
  
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
    <div className="radio-wave-simulator">
      <div className={`vintage-radio-cabinet ${!powerOn ? 'power-off' : ''}`}>
        {/* Parte superior con rejilla y título */}
        <div className="radio-speaker-grill">
          <div className="grill-lines"></div>
          <h2 className="radio-title">WAVE SIMULATOR</h2>
        </div>
        
        {/* Sección central con visualizador y perillas */}
        <div className="radio-main-panel">
          {/* Área de visualización */}
          <div className="wave-display-section">
            <WaveDisplay 
              waveParams={waveParams}
              getBaseColor={getBaseColor}
              svgRef={svgRef}
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
              
              <div className="theme-controls">
                <div className="theme-buttons">
                  <button 
                    className={`theme-button green ${displayTheme === 'green' ? 'active' : ''}`}
                    onClick={() => setHue(120)}
                    disabled={!powerOn}
                    title="Green Theme"
                  ></button>
                  <button 
                    className={`theme-button amber ${displayTheme === 'amber' ? 'active' : ''}`}
                    onClick={() => setHue(30)}
                    disabled={!powerOn}
                    title="Amber Theme"
                  ></button>
                  <button 
                    className={`theme-button blue ${displayTheme === 'blue' ? 'active' : ''}`}
                    onClick={() => setHue(210)}
                    disabled={!powerOn}
                    title="Blue Theme"
                  ></button>
                </div>
              </div>
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
          
          {/* Área de perillas/controles */}
          <div className="knobs-section">
            {/* Primera fila de perillas */}
            <div className="knobs-row">
              <div className="knob-unit">
                <VintageKnob 
                  value={amplitude} 
                  min={10} 
                  max={150} 
                  onChange={setAmplitude} 
                  size={70}
                  label="AMPLITUDE"
                  disabled={!powerOn}
                />
                <div className="knob-value">{amplitude}</div>
              </div>
              
              <div className="knob-unit">
                <VintageKnob 
                  value={frequency} 
                  min={0.5} 
                  max={5} 
                  onChange={setFrequency} 
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
                  onChange={(val) => setWaveform(val / 3)} 
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
                  onChange={(val) => setWaveCount(Math.floor(val))} 
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
                  onChange={setDistortion} 
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
                  onChange={setHarmonics} 
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
                  onChange={setTremolo} 
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
                  onChange={setModulation} 
                  size={70}
                  label="MODULATION"
                  disabled={!powerOn}
                />
                <div className="knob-value">{modulation.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Tercera fila de perillas y controles */}
            <div className="knobs-row">
              <div className="knob-unit">
                <VintageKnob 
                  value={phase} 
                  min={0} 
                  max={6.28} 
                  onChange={setPhase} 
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
                  onChange={setSaturation} 
                  size={70}
                  label="SATURATION"
                  disabled={!powerOn}
                />
                <div className="knob-value">{saturation}</div>
              </div>
              
              <div className="special-controls">
                <div className="effect-buttons">
                  <button 
                    className={`effect-button ${showScanline ? 'active' : ''}`}
                    onClick={() => toggleDisplayEffect('scanline')}
                    disabled={!powerOn}
                  >
                    SCAN
                  </button>
                  <button 
                    className={`effect-button ${showPersistence ? 'active' : ''}`}
                    onClick={() => toggleDisplayEffect('persistence')}
                    disabled={!powerOn}
                  >
                    PERSIST
                  </button>
                </div>
              </div>
              
              <div className="knob-unit power-control">
                <ToggleKnob 
                  value={powerOn ? 1 : 0} 
                  options={['OFF', 'ON']}
                  onChange={handlePowerToggle} 
                  size={70}
                  label="POWER"
                  highlight={true}
                />
                <div className={`knob-value ${powerOn ? 'on' : 'off'}`}>{powerOn ? "ON" : "OFF"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroRadioWaveSimulator;