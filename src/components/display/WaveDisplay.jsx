import React, { useEffect, useRef, useState } from 'react';
import { generateWavePoints } from '../Utils/WaveUtils';
import './WaveDisplay.css';

const WaveDisplay = ({ waveParams, getBaseColor, svgRef }) => {
  const { 
    waveCount, 
    powerOn, 
    svgDimensions, 
    amplitude, 
    frequency 
  } = waveParams;
  
  const canvasRef = useRef(null);
  const padding = 20;
  const [theme, setTheme] = useState('green'); // green, amber, blue
  const [showPersistence, setShowPersistence] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  
  // Afterglow effect on canvas
  useEffect(() => {
    if (!powerOn) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Create afterglow effect
    const afterglowEffect = () => {
      // Apply subtle fade to existing content for persistence effect
      ctx.fillStyle = `rgba(0, 0, 0, ${showPersistence ? 0.08 : 0.2})`;
      ctx.fillRect(0, 0, width, height);
      
      // Request next frame if powered on
      if (powerOn) {
        requestAnimationFrame(afterglowEffect);
      } else {
        // Clear when powered off
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, width, height);
      }
    };
    
    // Start animation
    afterglowEffect();
    
  }, [powerOn, showPersistence]);
  
  // Draw grid on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match container
    canvas.width = svgDimensions.width;
    canvas.height = svgDimensions.height;
    
    // Draw grid
    if (showGrid && powerOn) {
      ctx.strokeStyle = getGridColor(theme, 0.3);
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      const vStep = canvas.width / 10;
      for (let x = padding; x < canvas.width - padding; x += vStep) {
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
      }
      
      // Horizontal lines
      const hStep = canvas.height / 8;
      for (let y = padding; y < canvas.height - padding; y += hStep) {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }
      
      // Central bold lines
      ctx.strokeStyle = getGridColor(theme, 0.5);
      ctx.lineWidth = 1;
      
      // Bold horizontal center line
      ctx.beginPath();
      ctx.moveTo(padding, canvas.height / 2);
      ctx.lineTo(canvas.width - padding, canvas.height / 2);
      ctx.stroke();
      
      // Bold vertical center line
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, padding);
      ctx.lineTo(canvas.width / 2, canvas.height - padding);
      ctx.stroke();
    }
  }, [showGrid, powerOn, theme, svgDimensions]);
  
  // Get appropriate grid color based on theme
  const getGridColor = (theme, opacity = 1) => {
    switch(theme) {
      case 'amber': return `rgba(255, 191, 0, ${opacity})`;
      case 'blue': return `rgba(32, 156, 238, ${opacity})`;
      default: return `rgba(32, 238, 32, ${opacity})`; // green
    }
  };
  
  // Get appropriate wave glow color based on theme
  const getGlowColor = (theme) => {
    switch(theme) {
      case 'amber': return '#ff9500';
      case 'blue': return '#209cee';
      default: return '#20ee20'; // green
    }
  };
  
  // Calculate amplitude indicator position based on current amplitude
  const amplitudeIndicatorPosition = () => {
    const maxAmplitude = 150; // Max amplitude from controls
    const percentage = Math.min(100, (amplitude / maxAmplitude) * 100);
    return percentage;
  };
  
  // Calculate frequency indicator position based on current frequency
  const frequencyIndicatorPosition = () => {
    const maxFrequency = 5; // Max frequency from controls
    const percentage = (frequency / maxFrequency) * 100;
    return percentage;
  };
  
  // Get theme-based class
  const getThemeClass = () => {
    return `theme-${theme}`;
  };
  
  return (
    <div className="ultimate-wave-display-container">
      <div className={`ultimate-wave-display ${getThemeClass()} ${!powerOn ? 'powered-off' : ''}`}>
        {/* Theme selector buttons */}
        <div className="display-controls">
          <div className="theme-buttons">
            <button 
              className={`theme-button green ${theme === 'green' ? 'active' : ''}`} 
              onClick={() => setTheme('green')}
              disabled={!powerOn}
            ></button>
            <button 
              className={`theme-button amber ${theme === 'amber' ? 'active' : ''}`} 
              onClick={() => setTheme('amber')}
              disabled={!powerOn}
            ></button>
            <button 
              className={`theme-button blue ${theme === 'blue' ? 'active' : ''}`} 
              onClick={() => setTheme('blue')}
              disabled={!powerOn}
            ></button>
          </div>
          <div className="display-toggles">
            <button 
              className={`display-toggle ${showGrid ? 'active' : ''}`} 
              onClick={() => setShowGrid(!showGrid)}
              disabled={!powerOn}
            >
              GRID
            </button>
            <button 
              className={`display-toggle ${showPersistence ? 'active' : ''}`} 
              onClick={() => setShowPersistence(!showPersistence)}
              disabled={!powerOn}
            >
              PERSIST
            </button>
          </div>
        </div>
        
        {/* Phosphor persistence canvas */}
        <canvas 
          ref={canvasRef} 
          className="persistence-canvas"
          width={svgDimensions.width}
          height={svgDimensions.height}
        />
        
        {/* Indicators */}
        <div className="wave-indicators">
          <div className="amplitude-indicator">
            <div className="indicator-label">AMP</div>
            <div className="indicator-bar-container">
              <div 
                className="indicator-bar" 
                style={{ height: `${amplitudeIndicatorPosition()}%` }}
              ></div>
            </div>
          </div>
          <div className="frequency-indicator">
            <div className="indicator-label">FREQ</div>
            <div className="indicator-bar-container">
              <div 
                className="indicator-bar" 
                style={{ height: `${frequencyIndicatorPosition()}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Main wave SVG */}
        <div className="wave-svg-container">
          <svg 
            ref={svgRef} 
            className="wave-svg"
            width="100%" 
            height={svgDimensions.height}
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
          >
            {/* Center reference line */}
            <line 
              x1={padding} 
              y1={svgDimensions.height / 2} 
              x2={svgDimensions.width - padding} 
              y2={svgDimensions.height / 2} 
              strokeDasharray="4,4" 
              className="center-line"
            />
            
            {/* Wave polylines */}
            {powerOn && Array.from({ length: waveCount }).map((_, index) => (
              <polyline
                key={index}
                points={generateWavePoints(waveParams, index, padding)}
                fill="none"
                className={`wave-path wave-path-${index}`}
                style={{
                  stroke: getBaseColor(index),
                  strokeWidth: (4 - index * 0.3),
                  opacity: (1 - index * 0.1),
                  filter: `drop-shadow(0 0 ${3 - index * 0.5}px ${getGlowColor(theme)})`
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          
          {/* Scan line effect */}
          <div className={`scan-line ${powerOn ? 'active' : ''}`}></div>
          <div className="crt-overlay"></div>
        </div>
        
        {/* Scale markings */}
        <div className="scale-markings">
          <div className="horizontal-scale">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="scale-mark">
                <div className="scale-tick"></div>
                <div className="scale-value">{i}</div>
              </div>
            ))}
          </div>
          <div className="vertical-scale">
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                className="scale-mark"
                style={{ bottom: `${i * 12.5}%` }}
              >
                <div className="scale-tick"></div>
                <div className="scale-value">
                  {i === 4 ? '0' : (i < 4 ? `+${4-i}` : `-${i-4}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Power-on/off screen */}
        <div className={`power-screen ${!powerOn ? 'visible' : ''}`}>
          <div className="power-text">STANDBY</div>
        </div>
      </div>
    </div>
  );
};

export default WaveDisplay