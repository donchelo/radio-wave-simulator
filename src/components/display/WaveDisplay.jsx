import React, { useRef, useEffect, useState } from 'react';
import './WaveDisplay.css';
import { WaveLines } from './WaveLines';
import WaveInfo from './WaveInfo';

const WaveDisplay = ({ waveParams, svgRef }) => {
  const { 
    powerOn,
    displayTheme = 'green',
    noise = 0,
    brightness = 100,
    background = 0,
    glow = 0,
    afterglow = 0
  } = waveParams;
  
  const canvasRef = useRef(null);
  const [displayDimensions, setDisplayDimensions] = useState({ width: 800, height: 250 });
  const [showAfterimage, setShowAfterimage] = useState(false);
  
  // Update dimensions on resize
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
  
  // Effect for afterimage canvas
  useEffect(() => {
    if (!canvasRef.current || !powerOn || afterglow <= 0) {
      setShowAfterimage(false);
      return;
    }
    
    setShowAfterimage(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = displayDimensions.width;
    canvas.height = displayDimensions.height;
    
    // Persistence effect factor (higher afterglow = slower fade)
    const persistFactor = 1 - (afterglow / 1000);
    
    const drawLoop = () => {
      // Fade existing content
      ctx.fillStyle = `rgba(0, 0, 0, ${persistFactor})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw SVG to canvas
      const svgElement = svgRef.current;
      if (svgElement) {
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svgElement);
        
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);
      }
    };
    
    const animationInterval = setInterval(drawLoop, 50);
    return () => clearInterval(animationInterval);
  }, [powerOn, afterglow, displayDimensions, svgRef]);
  
  // Get noise overlay style
  const getNoiseStyle = () => {
    if (!powerOn || noise <= 0) return {};
    
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: noise * 0.01,
      mixBlendMode: 'overlay'
    };
  };
  
  // Dynamic styles based on parameters
  const getContainerStyle = () => {
    const style = {};
    
    // Background darkness
    if (background > 0) {
      style.backgroundColor = `rgba(0, 0, 0, ${0.8 + (background * 0.002)})`;
    }
    
    // Glow effect
    if (glow > 0) {
      const themeColor = 
        displayTheme === 'amber' ? '255, 149, 0' : 
        displayTheme === 'green' ? '32, 238, 32' : 
        displayTheme === 'blue' ? '32, 156, 238' : '255, 255, 255';
      
      style.boxShadow = `
        inset 0 0 20px rgba(0, 0, 0, 0.8),
        0 0 ${glow * 0.2}px rgba(${themeColor}, ${glow * 0.01})`;
    }
    
    return style;
  };
  
  return (
    <div className="wave-display-container">
      <div 
        className={`wave-display ${displayTheme} ${!powerOn ? 'powered-off' : ''}`}
        style={getContainerStyle()}
      >
        {/* Afterimage canvas for persistence effect */}
        {showAfterimage && (
          <canvas 
            ref={canvasRef}
            className="afterimage-canvas"
            width={displayDimensions.width}
            height={displayDimensions.height}
          />
        )}
        
        {/* Wave visualization SVG */}
        <svg 
          ref={svgRef} 
          width="100%" 
          height={displayDimensions.height}
          className="wave-svg"
        >
          {/* Center line */}
          <line 
            x1={10} 
            y1={displayDimensions.height / 2} 
            x2={displayDimensions.width - 10} 
            y2={displayDimensions.height / 2} 
            stroke="rgba(255, 255, 255, 0.2)" 
            strokeDasharray="4,4" 
            className="center-line"
          />
          
          {/* Wave lines */}
          <WaveLines 
            waveParams={waveParams}
            displayDimensions={displayDimensions}
          />
        </svg>
        
        {/* Noise overlay */}
        <div className="noise-overlay" style={getNoiseStyle()} />
        
        {/* CRT effect overlay */}
        <div className="crt-overlay" />
        
        {/* Power off screen */}
        {!powerOn && (
          <div className="power-screen">
            <div className="power-text">STANDBY</div>
          </div>
        )}
        
        {/* Wave info indicator */}
        {powerOn && <WaveInfo waveParams={waveParams} />}
        
        {/* Display controls */}
        <div className="display-indicators">
          <div className="brightness-indicator">
            <div className="indicator-bar" style={{ height: `${Math.min(100, brightness)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveDisplay;