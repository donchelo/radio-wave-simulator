import React, { useRef, useEffect, useState } from 'react';
import { generateWavePoints, getThemeColor } from '../Utils/WaveUtils';
import './WaveDisplay.css';

// Wave visualization subcomponent
const WaveLines = ({ waveParams, displayDimensions, getBaseColor }) => {
 const { 
   waveCount, textWaveMode, textWaveData, echo, glitch, 
   glow, afterglow, displayTheme, brightness, powerOn 
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

// Main WaveDisplay component
const WaveDisplay = ({ waveParams, svgRef }) => {
 const { 
   powerOn,
   displayTheme,
   noise,
   brightness = 100,
   waveform,
   background = 0,
   glow = 0,
   textWaveMode,
   colorMode
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
   if (!canvasRef.current || !powerOn || waveParams.afterglow <= 0) {
     setShowAfterimage(false);
     return;
   }
   
   setShowAfterimage(true);
   const canvas = canvasRef.current;
   const ctx = canvas.getContext('2d');
   
   // Set canvas dimensions
   canvas.width = displayDimensions.width;
   canvas.height = displayDimensions.height;
   
   // Persistence effect factor
   const persistFactor = 1 - (waveParams.afterglow / 1000);
   
   const drawLoop = () => {
     // Fade existing content
     ctx.fillStyle = `rgba(0, 0, 0, ${persistFactor})`;
     ctx.fillRect(0, 0, canvas.width, canvas.height);
     
     // Get SVG content
     const svgElement = svgRef.current;
     if (svgElement) {
       // Draw SVG to canvas
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
 }, [powerOn, waveParams.afterglow, displayDimensions, svgRef]);
 
 // Get waveform name for display
 const getWaveformName = () => {
   if (textWaveMode) return "TEXT WAVE";
   
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
 
 // Get color based on theme
 const getBaseColor = getThemeColor;
 
 return (
   <div className="wave-display-container">
     <div 
       className={`wave-display ${displayTheme} ${!powerOn ? 'powered-off' : ''}`}
       style={{
         backgroundColor: background > 0 
           ? `rgba(0, 0, 0, ${0.8 + (background * 0.002)})` 
           : undefined,
         boxShadow: glow > 50 
           ? `0 0 ${glow * 0.2}px rgba(${displayTheme === 'amber' ? '255, 149, 0' : 
              displayTheme === 'green' ? '32, 238, 32' : 
              displayTheme === 'blue' ? '32, 156, 238' : '255, 255, 255'}, ${glow * 0.01})` 
           : undefined
       }}
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
           getBaseColor={getBaseColor}
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
           <span className="wave-type">{getWaveformName()}</span>
           {colorMode === 'rainbow' && <span className="color-mode">RAINBOW</span>}
         </div>
       )}
       
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