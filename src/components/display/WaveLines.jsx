import React from 'react';
import { generateWavePoints, getThemeColor } from '../Utils/WaveUtils';

export const WaveLines = ({ waveParams, displayDimensions }) => {
  const { 
    waveCount, 
    textWaveMode, 
    textWaveData, 
    afterglow, 
    glitch, 
    glow,
    displayTheme,
    brightness,
    powerOn
  } = waveParams;
  
  // Glitch effect style generator
  const getGlitchStyle = () => {
    if (!powerOn || glitch <= 0) return {};
    
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
    // Calculate total waves including echoes/afterglow
    const totalWaves = afterglow > 0 ? waveCount * 2 : waveCount;
    
    return Array.from({ length: totalWaves }).map((_, index) => {
      const isEchoWave = index >= waveCount;
      const effectiveIndex = isEchoWave ? index - waveCount : index;
      const echoOpacity = isEchoWave ? (afterglow / 100) * (1 - effectiveIndex * 0.2) : 1 - index * 0.1;
      
      // Get color with all parameters
      const { color, style } = getThemeColor(displayTheme, echoOpacity, {
        brightness,
        glow: isEchoWave ? 0 : glow,
        waveIndex: effectiveIndex,
        ...waveParams
      });
      
      const combinedStyle = isEchoWave 
        ? { opacity: echoOpacity }
        : { ...getGlitchStyle(), ...style ? { filter: style.filter } : {} };
      
      return (
        <polyline
          key={index}
          points={generateWavePoints({
            ...waveParams,
            svgDimensions: displayDimensions
          }, effectiveIndex, 10)}
          fill="none"
          stroke={color}
          strokeWidth={isEchoWave ? 1 : 3 - effectiveIndex * 0.3}
          strokeLinecap="round"
          style={combinedStyle}
        />
      );
    });
  }
  
  // Render text wave (if available)
  if (textWaveData && textWaveData.length > 0) {
    // Main text wave
    const { color, style } = getThemeColor(displayTheme, 1, {
      brightness,
      glow,
      ...waveParams
    });
    
    // Echo/afterglow effect
    const { color: echoColor } = getThemeColor(displayTheme, 0.5 * (afterglow / 100), {
      brightness: brightness * 0.8,
      ...waveParams
    });
    
    return (
      <>
        <polyline
          points={textWaveData.map(point => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          style={{...getGlitchStyle(), ...style ? { filter: style.filter } : {}}}
        />
        
        {afterglow > 0 && (
          <polyline
            points={textWaveData.map(point => `${point.x + 5},${point.y + 3}`).join(' ')}
            fill="none"
            stroke={echoColor}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )}
      </>
    );
  }
  
  return null;
};