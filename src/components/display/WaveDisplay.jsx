import React, { useRef, useEffect, useState } from 'react';
import { generateWavePoints } from '../Utils/WaveUtils';

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
    showScanline,
    showPersistence,
    time,
    waveform
  } = waveParams;
  
  const canvasRef = useRef(null);
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
  
  // Efecto para dibujar ondas con persistencia
  useEffect(() => {
    if (!powerOn || !canvasRef.current || !showPersistence) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = displayDimensions;
    
    // Configurar canvas
    canvas.width = width;
    canvas.height = height;
    
    const drawWave = () => {
      // Aplicar desvanecimiento gradual
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      if (textWaveMode && textWaveData && textWaveData.length > 0) {
        // Dibujar onda basada en texto
        ctx.beginPath();
        for (let i = 0; i < textWaveData.length; i++) {
          const point = textWaveData[i];
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.strokeStyle = getBaseColor(0);
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Dibujar ondas normales
        for (let i = 0; i < waveCount; i++) {
          const points = generateWavePoints({
            ...waveParams,
            svgDimensions: displayDimensions
          }, i, 10)
            .split(' ')
            .map(point => {
              const [x, y] = point.split(',');
              return { x: parseFloat(x), y: parseFloat(y) };
            });
          
          if (points.length < 2) continue;
          
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          
          for (let j = 1; j < points.length; j++) {
            ctx.lineTo(points[j].x, points[j].y);
          }
          
          ctx.strokeStyle = getBaseColor(i);
          ctx.lineWidth = 3 - i * 0.3;
          ctx.stroke();
        }
      }
    };
    
    // Iniciar animación
    let animationId;
    if (powerOn) {
      const animate = () => {
        drawWave();
        animationId = requestAnimationFrame(animate);
      };
      animate();
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [powerOn, waveParams, textWaveMode, textWaveData, showPersistence, displayDimensions, getBaseColor, waveCount]);
  
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
  
  return (
    <div className="wave-display-container">
      <div className={`wave-display ${displayTheme} ${!powerOn ? 'powered-off' : ''}`}>
        {/* Canvas para efecto de persistencia */}
        {showPersistence && (
          <canvas 
            ref={canvasRef} 
            className="persistence-canvas"
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0
            }}
          />
        )}
        
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
          
          {/* Renderizar ondas solo si no estamos usando persistencia */}
          {(!showPersistence || !powerOn) && !textWaveMode && (
            Array.from({ length: waveCount }).map((_, index) => (
              <polyline
                key={index}
                points={generateWavePoints({
                  ...waveParams,
                  svgDimensions: displayDimensions
                }, index, 10)}
                fill="none"
                stroke={getBaseColor(index)}
                strokeWidth={3 - index * 0.3}
                strokeLinecap="round"
                strokeOpacity={1 - index * 0.1}
              />
            ))
          )}
          
          {/* Renderizar onda de texto si está en modo texto y no usamos persistencia */}
          {(!showPersistence || !powerOn) && textWaveMode && textWaveData && textWaveData.length > 0 && (
            <polyline
              points={textWaveData.map(point => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={getBaseColor(0)}
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
        </svg>
        
        {/* Efecto de línea de escaneo */}
        {showScanline && powerOn && (
          <div 
            className="scan-line"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'rgba(255, 255, 255, 0.15)',
              animation: 'scanAnimation 8s linear infinite',
              zIndex: 2
            }}
          />
        )}
        
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
            zIndex: 3,
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
      
      {/* Indicador de tipo de onda */}
      <div className="waveform-indicator">
        <div>
          {powerOn && (
            <>
              {textWaveMode ? "TEXT WAVE" : getWaveformName()}
            </>
          )}
          {!powerOn && "STANDBY"}
        </div>
      </div>
    </div>
  );
};

export default WaveDisplay;