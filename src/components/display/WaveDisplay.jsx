import React, { useRef, useEffect, useState } from 'react';
import { generateWavePoints, getThemeColor } from '../Utils/WaveUtils';

// Componente principal de visualización de ondas
const WaveDisplay = ({ waveParams, getBaseColor, svgRef }) => {
  const { 
    amplitude, 
    frequency, 
    waveCount, 
    powerOn, 
    textWaveMode,
    textWaveData,
    displayTheme,
    time,
    waveform,
    // Nuevos parámetros
    brightness,
    noise,
    glitch,
    echo
  } = waveParams;
  
  const [displayDimensions, setDisplayDimensions] = useState({ width: 800, height: 250 });
  
  // Actualizar dimensiones cuando cambia el tamaño
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDisplayDimensions({ width, height: 250 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [svgRef]);
  
  // Obtener el nombre del tipo de onda
  const getWaveformName = () => {
    const waveformIndex = Math.floor(waveform * 4);
    switch(waveformIndex) {
      case 1: return "SQUARE WAVE";
      case 2: return "TRIANGLE WAVE";
      case 3: return "SAWTOOTH WAVE";
      default: return "SINE WAVE";
    }
  };
  
  // Calcular estilos para efectos
  const getNoiseStyle = () => {
    if (!powerOn || noise <= 0) return {};
    
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: noise * 0.01,
      mixBlendMode: 'overlay',
      pointerEvents: 'none'
    };
  };
  
  const getGlitchStyle = () => {
    if (!powerOn || glitch <= 0) return {};
    
    // Calcular valores aleatorios para transformaciones glitch
    const randomShift = () => (Math.random() * 2 - 1) * glitch * 0.05;
    
    return {
      animation: glitch > 50 ? 'glitchEffect 0.3s infinite' : 'glitchEffect 0.5s infinite',
      animationTimingFunction: 'steps(2, end)',
      transform: `translate(${randomShift()}px, ${randomShift()}px) skew(${randomShift()}deg)`,
      pointerEvents: 'none'
    };
  };
  
  return (
    <div className="wave-display-container">
      <div className={`wave-display ${displayTheme} ${!powerOn ? 'powered-off' : ''}`}>
        {/* SVG para visualización de ondas */}
        <svg 
          ref={svgRef} 
          width="100%" 
          height={displayDimensions.height}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* Línea central */}
          <line 
            x1={10} 
            y1={displayDimensions.height / 2} 
            x2={displayDimensions.width - 10} 
            y2={displayDimensions.height / 2} 
            stroke="rgba(255, 255, 255, 0.2)" 
            strokeDasharray="4,4" 
          />
          
          {/* Renderizar ondas normales y ecos */}
          {!textWaveMode && (
            // Calcular cuántas ondas dibujar en total (incluyendo ecos)
            Array.from({ length: echo > 0 ? waveCount * 2 : waveCount }).map((_, index) => {
              // Determinar si esta es una onda de eco
              const isEchoWave = index >= waveCount;
              
              // Usar opacidad reducida para ecos
              const echoOpacity = isEchoWave ? (1 - (index - waveCount) * 0.2) * 0.7 : 1 - index * 0.1;
              
              return (
                <polyline
                  key={index}
                  points={generateWavePoints({
                    ...waveParams,
                    svgDimensions: displayDimensions
                  }, index, 10)}
                  fill="none"
                  stroke={getThemeColor(displayTheme, echoOpacity, brightness)}
                  strokeWidth={isEchoWave ? 1 : 3 - index * 0.3}
                  strokeLinecap="round"
                  style={isEchoWave ? {} : getGlitchStyle()}
                />
              );
            })
          )}
          
          {/* Renderizar onda de texto */}
          {textWaveMode && textWaveData && textWaveData.length > 0 && (
            <>
              <polyline
                points={generateWavePoints({
                  ...waveParams,
                  svgDimensions: displayDimensions
                }, 0, 10)}
                fill="none"
                stroke={getThemeColor(displayTheme, 1, brightness)}
                strokeWidth={2}
                strokeLinecap="round"
                style={getGlitchStyle()}
              />
              
              {/* Renderizar eco si está habilitado */}
              {echo > 0 && (
                <polyline
                  points={generateWavePoints({
                    ...waveParams,
                    svgDimensions: displayDimensions
                  }, 1, 10)}
                  fill="none"
                  stroke={getThemeColor(displayTheme, 0.5, brightness)}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
            </>
          )}
        </svg>
        
        {/* Efecto de ruido estático */}
        <div 
          className="noise-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            ...getNoiseStyle()
          }}
        />
        
        {/* Efecto CRT */}
        <div 
          className="crt-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle, transparent 50%, rgba(0, 0, 0, 0.3) 100%)',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />
        
        {/* Pantalla de apagado */}
        {!powerOn && (
          <div 
            className="power-screen"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <div 
              className="power-text"
              style={{
                fontFamily: 'monospace',
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'rgba(180, 180, 180, 0.2)',
                letterSpacing: '0.2em'
              }}
            >
              STANDBY
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveDisplay;