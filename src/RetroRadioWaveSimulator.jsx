import React, { useState, useEffect, useRef } from 'react';
import VintageKnob from './VintageKnob';
import ToggleKnob from './ToggleKnob';
import TextToLetterWave from './TextToLetterWave';
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
  const [powerOn, setPowerOn] = useState(true); // Estado para el interruptor de encendido
  const [textWaveData, setTextWaveData] = useState([]); // Datos de onda generados desde texto
  const [textWaveMode, setTextWaveMode] = useState(false); // Modo de visualización de texto
  
  // Calcula el color base en formato HSL
  const getBaseColor = (waveIndex = 0) => {
    const waveHue = (hue + waveIndex * 10) % 360;
    return `hsl(${waveHue}, ${saturation}%, 70%)`;
  };
  
  // Dimensiones responsive del SVG
  const svgRef = useRef(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 250 });
  const padding = 10;
  
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
    
    // Si recibimos datos de onda de texto, activamos automáticamente el modo de texto
    if (waveData && waveData.length > 0) {
      setTextWaveMode(true);
    }
  };
  
  // Genera los puntos para una onda específica
  const generateWavePoints = (waveIndex) => {
    // Si estamos en modo de onda de texto y hay datos disponibles, usamos esos
    if (textWaveMode && textWaveData.length > 0) {
      // Para evitar demasiadas ondas superpuestas en modo texto
      if (waveIndex > 0) {
        // Solo mostramos una capa para las ondas de texto
        return '';
      }
      
      // Convertir puntos a formato string para polyline
      const pointsStr = textWaveData.map((point) => {
        return `${point.x},${point.y}`;
      }).join(' ');
      
      return pointsStr;
    }
    
    const points = [];
    const steps = 100;
    const { width, height } = svgDimensions;
    
    // Si está apagado, mostrar una línea plana en el centro
    if (!powerOn) {
      return `${padding},${height / 2} ${width - padding},${height / 2}`;
    }
    
    // Ajusta la fase y la amplitud ligeramente para cada onda
    const wavePhaseOffset = waveIndex * (Math.PI / 8);
    const waveAmplitude = amplitude * (1 - waveIndex * 0.15);
    
    // Efecto de tremolo (modulación de amplitud)
    const tremoloEffect = tremolo > 0 ? 1 - (tremolo * 0.5 * Math.sin(time * 5)) : 1;
    
    // Genera cada punto de la onda
    for (let i = 0; i <= steps; i++) {
      const x = i * ((width - padding * 2) / steps) + padding;
      const normalX = i / steps;
      
      // Modulación de frecuencia
      const modFreq = modulation > 0 
        ? frequency * (1 + modulation * 0.3 * Math.sin(time * 2)) 
        : frequency;
      
      // Calcular la fase total con efectos
      const totalPhase = normalX * modFreq * Math.PI * 2 + phase + wavePhaseOffset + time;
      
      // Seleccionar forma de onda según el parámetro waveform
      let waveValue;
      switch(Math.floor(waveform * 4)) {
        case 1: // Onda cuadrada
          waveValue = Math.sin(totalPhase) >= 0 ? 1 : -1;
          break;
        case 2: // Onda triangular
          waveValue = Math.asin(Math.sin(totalPhase)) * (2/Math.PI);
          break;
        case 3: // Onda de sierra
          waveValue = (2 * (totalPhase/(2*Math.PI) - Math.floor(0.5 + totalPhase/(2*Math.PI))));
          break;
        default: // Onda senoidal (por defecto)
          waveValue = Math.sin(totalPhase);
      }
      
      // Aplicar distorsión (simular clipping/saturación)
      if (distortion > 0) {
        waveValue = Math.tanh(waveValue * (1 + distortion * 3)) / Math.tanh(1 + distortion * 3);
      }
      
      // Aplicar armónicos adicionales
      if (harmonics > 0) {
        // Añadir tercer armónico
        waveValue += harmonics * 0.3 * Math.sin(totalPhase * 3);
        // Añadir quinto armónico
        waveValue += harmonics * 0.15 * Math.sin(totalPhase * 5);
        
        // Normalizar la amplitud después de añadir armónicos
        waveValue /= (1 + harmonics * 0.45);
      }
      
      // Aplicar efecto de tremolo (modulación de amplitud)
      waveValue *= tremoloEffect;
      
      const y = height / 2 - waveAmplitude * waveValue;
      
      points.push(`${x},${y}`);
    }
    
    return points.join(" ");
  };
  
  // Agrupar parámetros de onda para pasarlos al módulo de texto
  const waveParams = {
    amplitude,
    frequency,
    phase, 
    waveform,
    distortion,
    harmonics,
    modulation,
    tremolo
  };
  
  return (
    <div className="radio-container">
      <div className={`radio-cabinet ${!powerOn ? 'power-off' : ''}`}>
        <div className="radio-panel">
          <div className="radio-layout">
            {/* Sección izquierda - Controles */}
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
            
            {/* Sección derecha - Visualizador */}
            <div className="display-section">
              <div className="wave-display-container">
                <div className={`wave-display ${!powerOn ? 'powered-off' : ''}`}>
                  <svg ref={svgRef} width="100%" height={svgDimensions.height}>
                    <line 
                      x1={padding} 
                      y1={svgDimensions.height / 2} 
                      x2={svgDimensions.width - padding} 
                      y2={svgDimensions.height / 2} 
                      stroke="#333" 
                      strokeDasharray="4,4" 
                    />
                    
                    {Array.from({ length: waveCount }).map((_, index) => (
                      <polyline
                        key={index}
                        points={generateWavePoints(index)}
                        fill="none"
                        stroke={getBaseColor(index)}
                        strokeWidth={3 - index * 0.3}
                        strokeLinecap="round"
                        strokeOpacity={1 - index * 0.1}
                      />
                    ))}
                  </svg>
                </div>
              </div>
              
              <div className="wave-mode-selector">
                <ToggleKnob 
                  value={textWaveMode ? 1 : 0} 
                  options={['AUTO', 'TEXT']}
                  onChange={handleWaveModeToggle} 
                  size={60}
                  label="WAVE SOURCE"
                  disabled={!powerOn}
                />
              </div>
              
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