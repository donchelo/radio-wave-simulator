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
  const [hue, setHue] = useState(40);
  const [saturation, setSaturation] = useState(30);
  const [time, setTime] = useState(0);
  const [distortion, setDistortion] = useState(0);
  const [harmonics, setHarmonics] = useState(0);
  const [modulation, setModulation] = useState(0);
  const [tremolo, setTremolo] = useState(0);
  const [waveform, setWaveform] = useState(0); // 0: sine, 1: square, 2: triangle, 3: sawtooth
  const [powerOn, setPowerOn] = useState(true);
  const [textWaveData, setTextWaveData] = useState([]);
  const [textWaveMode, setTextWaveMode] = useState(false);
  
  // Dimensiones responsive del SVG
  const svgRef = useRef(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 250 });
  
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
  
  // Manejador para el botón de encendido
  const handlePowerToggle = (value) => {
    setPowerOn(value === 1);
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
    svgDimensions
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
    handleWaveModeToggle
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