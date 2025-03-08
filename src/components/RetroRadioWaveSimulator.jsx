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
    brightness: 100,
    noise: 0,
    glitch: 0,
    speed: 1,
    echo: 0,
    colorSpread: 10,
    glow: 0,
    background: 0,
    afterglow: 0,
    colorMode: 'theme'
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
    if (waveParams.colorMode === 'theme') {
      const { hue } = waveParams;
      let theme = waveParams.displayTheme;
      
      if (hue >= 90 && hue < 150) {
        theme = 'green';
      } else if (hue >= 0 && hue < 60) {
        theme = 'amber';
      } else if (hue >= 180 && hue < 270) {
        theme = 'blue';
      } else if (hue >= 270 && hue < 330) {
        theme = 'purple';
      } else {
        theme = 'teal';
      }
      
      if (theme !== waveParams.displayTheme) {
        setWaveParams(prev => ({ ...prev, displayTheme: theme }));
      }
    }
  }, [waveParams.hue, waveParams.colorMode]);
  
  // Función para actualizar cualquier parámetro
  const updateParam = (param, value) => {
    setWaveParams(prev => ({ ...prev, [param]: value }));
  };
  
  // Funciones específicas para controles comunes
  const handlePowerToggle = (value) => {
    const powerOn = value === 1;
    updateParam('powerOn', powerOn);
  };
  
  const handleTextWaveGenerated = (waveData) => {
    updateParam('textWaveData', waveData);
    
    if (waveData && waveData.length > 0) {
      updateParam('textWaveMode', true);
    }
  };
  
  // Calcula el color base en formato HSL con aplicación de brillo
  const getBaseColor = (waveIndex = 0) => {
    const { hue, saturation, brightness, colorSpread, colorMode } = waveParams;
    
    let waveHue = hue;
    if (colorMode === 'rainbow') {
      waveHue = (hue + (waveIndex * 30)) % 360;
    } else {
      waveHue = (hue + (waveIndex * (colorSpread || 10))) % 360;
    }
    
    const brightnessValue = brightness || 100;
    const luminosity = Math.min(90, 70 * (brightnessValue / 100));
    
    return `hsl(${waveHue}, ${saturation}%, ${luminosity}%)`;
  };
  
  return (
    <div className="retro-radio-simulator">
      <div className="simulator-top-section">
        <div className="left-panel">
          <PowerKnob 
            value={waveParams.powerOn ? 1 : 0}
            onChange={handlePowerToggle}
          />
        </div>
        <DisplaySection 
          waveParams={waveParams}
          svgRef={svgRef}
          svgDimensions={svgDimensions}
          getBaseColor={getBaseColor}
          onTextWaveGenerated={handleTextWaveGenerated}
        />
      </div>
      
      <ControlPanel 
        waveParams={waveParams} 
        updateParam={updateParam}
      />
    </div>
  );
};

export default RetroRadioWaveSimulator;