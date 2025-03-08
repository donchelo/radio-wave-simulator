import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './ControlPanel';
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
    showPersistence
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
  
  return (
    <div className="radio-container">
      <div className={`radio-cabinet ${!powerOn ? 'power-off' : ''}`}>
        <div className="radio-panel">
          <div className="radio-layout">
            {/* Sección izquierda - Controles */}
            <ControlPanel 
              waveParams={waveParams} 
              setters={setterFunctions} 
            />
            
            {/* Sección derecha - Visualizador */}
            <div className="display-section">
              <WaveDisplay 
                waveParams={waveParams}
                getBaseColor={getBaseColor}
                svgRef={svgRef}
              />
              
              <div className="display-controls">
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
                
                <div className="display-toggles">
                  <button 
                    className={`display-toggle ${showScanline ? 'active' : ''}`}
                    onClick={() => toggleDisplayEffect('scanline')}
                    disabled={!powerOn}
                    title="Toggle Scanline Effect"
                  >
                    SCAN
                  </button>
                  <button 
                    className={`display-toggle ${showPersistence ? 'active' : ''}`}
                    onClick={() => toggleDisplayEffect('persistence')}
                    disabled={!powerOn}
                    title="Toggle Persistence Effect"
                  >
                    PERSIST
                  </button>
                </div>
              </div>
              
              <WaveModeSelector
                textWaveMode={textWaveMode}
                powerOn={powerOn}
                onToggle={handleWaveModeToggle}
              />
              
              {/* Módulo de texto a onda */}
              <TextToLetterWave 
                waveParams={waveParams}
                onTextWaveGenerated={handleTextWaveGenerated}
                powerOn={powerOn}
                width={svgDimensions.width}
                height={svgDimensions.height}
              />
              
              <div className="waveform-indicator">
                <div>
                  {powerOn && (
                    <>
                      {textWaveMode ? "TEXT WAVE" : (
                        <>
                          {Math.floor(waveform * 4) === 0 && "SINE WAVE"}
                          {Math.floor(waveform * 4) === 1 && "SQUARE WAVE"}
                          {Math.floor(waveform * 4) === 2 && "TRIANGLE WAVE"}
                          {Math.floor(waveform * 4) === 3 && "SAWTOOTH WAVE"}
                        </>
                      )}
                    </>
                  )}
                  {!powerOn && "STANDBY"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroRadioWaveSimulator;