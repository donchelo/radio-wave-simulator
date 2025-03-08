import React, { useRef, useEffect, useState } from 'react';
import { generateWavePoints, getThemeColor } from '../Utils/WaveUtils';
import './WaveDisplay.css';

// Wave visualization subcomponent
const WaveLines = ({ waveParams, displayDimensions, displayTheme, brightness }) => {
  const { waveCount, textWaveMode, textWaveData, echo, glitch } = waveParams;
  
  // Glitch effect style generator
  const getGlitchStyle = () => {
    if (!waveParams.powerOn || glitch <= 0) return {};
    
    const randomShift = () => (Math.random() * 2 - 1) * glitch * 0.05;
    
    return {
      animation: glitch > 50 ? 'glitchEffect 0.3s infinite' : 'glitchEffect 0.5s infinite',
      animationTimingFunction: 'steps(2, end)',
      transform: `translate(${randomShift()}px, ${randomShift()}px) skew(${randomShift()}deg)`,
      pointerEvents: 'none'
    };
  };
  
  // Render normal waves
  if (!textWaveMode) {
    // Calculate total waves including echoes
    const totalWaves = echo > 0 ? waveCount * 2 : waveCount;
    
    return Array.from({ length: totalWaves }).map((_, index) => {
      const isEchoWave = index >= waveCount;
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
    });
  }
  
  // Render text wave (if available)
  if (textWaveData && textWaveData.length > 0) {
    return (
      <>
        <polyline
          points={textWaveData.map(point => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke={getThemeColor(displayTheme, 1, brightness)}
          strokeWidth={2}
          strokeLinecap="round"
          style={getGlitchStyle()}
        />
        
        {echo > 0 && (
          <polyline
            points={textWaveData.map(point => `${point.x + 5},${point.y + 3}`).join(' ')}
            fill="none"
            stroke={getThemeColor(displayTheme, 0.5, brightness)}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )}
      </>
    );
  }
  
  return null;
};

// Main WaveDisplay component
const WaveDisplay = ({ waveParams, svgRef }) => {
  const { 
    powerOn,
    displayTheme,
    noise,
    brightness = 100,
    waveform
  } = waveParams;
  
  const [displayDimensions, setDisplayDimensions] = useState({ width: 800, height: 250 });
  
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
  
  // Get waveform name for display
  const getWaveformName = () => {
    const waveformIndex = Math.floor(waveform * 4);
    switch(waveformIndex) {
      case 1: return "SQUARE WAVE";
      case 2: return "TRIANGLE WAVE";
      case 3: return "SAWTOOTH WAVE";
      default: return "SINE WAVE";
    }
  };
  
  // Get noise overlay style
  const getNoiseStyle = () => {
    if (!powerOn || noise <= 0) return {};
    
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: noise * 0.01,
      mixBlendMode: 'overlay'
    };
  };
  
  return (
    <div className="wave-display-container">
      <div className={`wave-display ${displayTheme} ${!powerOn ? 'powered-off' : ''}`}>
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
            displayTheme={displayTheme}
            brightness={brightness}
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
        {powerOn && (
          <div className="wave-info">
            {waveParams.textWaveMode ? "TEXT WAVE" : getWaveformName()}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveDisplay;