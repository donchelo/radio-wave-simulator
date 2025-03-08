import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './ControlPanel';
import DisplaySection from './display/DisplaySection';
import PowerKnob from './controls/PowerKnob';
import './styles/RetroRadioWaveSimulator.css';

const RetroRadioWaveSimulator = () => {
  // Estados para controlar los parámetros de las ondas
  const [waveParams, setWaveParams] = useState({
    amplitude: 50,
    frequency: 1,
    phase: 0,
    waveCount: 3,
    hue: 120,
    saturation: 70,
    time: 0,
    distortion: 0,
    harmonics: 0,
    modulation: 0,
    tremolo: 0,
    waveform: 0,
    powerOn: true,
    textWaveMode: false,
    textWaveData: [],
    displayTheme: 'green',
    // Nuevos parámetros visuales
    brightness: 100, // 0-200% (100% es normal)
    noise: 0,        // 0-100%
    glitch: 0,       // 0-100%
    speed: 1,        // 0.1-5x (1x es normal)
    echo: 0          // 0-100%
  });
  
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
  
  // Animación - solo activa cuando está encendido y ahora afectada por la velocidad
  useEffect(() => {
    let timer;
    if (waveParams.powerOn) {
      timer = setInterval(() => {
        setWaveParams(prev => ({
          ...prev,
          time: (prev.time + 0.1 * prev.speed) % 100
        }));
      }, 50);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [waveParams.powerOn, waveParams.speed]);
  
  // Cambiar tema con el cambio de hue
  useEffect(() => {
    // Asignar tema basado en el rango de hue
    const { hue } = waveParams;
    let theme = waveParams.displayTheme;
    
    if (hue >= 90 && hue < 150) {
      theme = 'green';
    } else if (hue >= 0 && hue < 60) {
      theme = 'amber';
    } else if (hue >= 180 && hue < 270) {
      theme = 'blue';
    }
    
    if (theme !== waveParams.displayTheme) {
      setWaveParams(prev => ({ ...prev, displayTheme: theme }));
    }
  }, [waveParams.hue]);
  
  // Función para actualizar cualquier parámetro
  const updateParam = (param, value) => {
    setWaveParams(prev => ({ ...prev, [param]: value }));
  };
  
  // Funciones específicas para controles comunes
  const handlePowerToggle = (value) => {
    const powerOn = value === 1;
    updateParam('powerOn', powerOn);
  };
  
  const handleWaveModeToggle = (value) => {
    updateParam('textWaveMode', value === 1);
  };
  
  const handleTextWaveGenerated = (waveData) => {
    updateParam('textWaveData', waveData);
    
    if (waveData && waveData.length > 0) {
      updateParam('textWaveMode', true);
    }
  };
  
  // Calcula el color base en formato HSL con aplicación de brillo
  const getBaseColor = (waveIndex = 0) => {
    const waveHue = (waveParams.hue + waveIndex * 10) % 360;
    // Aplicar el parámetro de brillo (brightness) al valor de luminosidad
    const brightness = waveParams.brightness || 100;
    const luminosity = Math.min(90, 70 * (brightness / 100));
    return `hsl(${waveHue}, ${waveParams.saturation}%, ${luminosity}%)`;
  };
  
  return (
    <div className="radio-wave-simulator">
      <div className={`vintage-radio-cabinet ${!waveParams.powerOn ? 'power-off' : ''}`}>
        {/* Parte superior con rejilla, título y botón de encendido */}
        <div className="radio-header">
          <div className="radio-speaker-grill">
            <div className="grill-lines"></div>
            <h2 className="radio-title">WAVE SIMULATOR</h2>
          </div>
          
          <div className="power-button-container">
            <PowerKnob 
              value={waveParams.powerOn ? 1 : 0} 
              onChange={handlePowerToggle} 
              size={80}
              label="POWER"
            />
          </div>
        </div>
        
        {/* Sección central con visualizador y perillas */}
        <div className="radio-main-panel">
          {/* Sección de visualización primero */}
          <DisplaySection 
            waveParams={waveParams}
            svgRef={svgRef}
            svgDimensions={svgDimensions}
            updateParam={updateParam}
            getBaseColor={getBaseColor}
            handleWaveModeToggle={handleWaveModeToggle}
            handleTextWaveGenerated={handleTextWaveGenerated}
          />
          
          {/* Panel de control con perillas debajo */}
          <ControlPanel 
            waveParams={waveParams} 
            updateParam={updateParam}
            handlePowerToggle={handlePowerToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default RetroRadioWaveSimulator;