// Enhanced utilities for wave generation and manipulation

/**
 * Generates points for a specific wave with advanced visualization effects
 * @param {Object} waveParams - Wave parameters
 * @param {Number} waveIndex - Index of the wave
 * @param {Number} padding - Edge padding
 * @returns {String} Points string for SVG polyline
 */
export const generateWavePoints = (waveParams, waveIndex, padding = 10) => {
  const {
    amplitude = 50,
    frequency = 1,
    phase = 0,
    time = 0,
    distortion = 0,
    harmonics = 0,
    modulation = 0,
    tremolo = 0,
    waveform = 0,
    powerOn = true,
    textWaveMode = false,
    textWaveData = [],
    svgDimensions = { width: 800, height: 250 },
    colorSpread = 10,
    colorMode = 'theme',
    afterglow = 0,
    glitch = 0
  } = waveParams;
  
  const { width, height } = svgDimensions;
  
  // Handle text wave mode
  if (textWaveMode && textWaveData && textWaveData.length > 0) {
    // For multi-wave effects, only show main text wave on first layer
    if (waveIndex > 0) {
      // Create echo/ghost effect for text waves if afterglow is enabled
      if (afterglow > 0 && waveIndex < 3) {
        const offset = waveIndex * 3;
        const offsetY = offset * 2 * (Math.random() * 0.5 + 0.75); // Add subtle randomness
        
        return textWaveData.map((point) => {
          // Add glitch effect if enabled
          const glitchX = glitch > 0 ? (Math.random() * glitch * 0.2) - (glitch * 0.1) : 0;
          return `${point.x + offset + glitchX},${point.y + offsetY}`;
        }).join(' ');
      }
      return '';
    }
    
    // Main text wave with optional glitch
    return textWaveData.map((point) => {
      const glitchX = glitch > 0 && Math.random() < 0.1 ? (Math.random() * glitch * 0.3) - (glitch * 0.15) : 0;
      const glitchY = glitch > 0 && Math.random() < 0.1 ? (Math.random() * glitch * 0.3) - (glitch * 0.15) : 0;
      return `${point.x + glitchX},${point.y + glitchY}`;
    }).join(' ');
  }
  
  // For powered off state, show flat line
  if (!powerOn) {
    return `${padding},${height / 2} ${width - padding},${height / 2}`;
  }
  
  const points = [];
  const steps = 240; // Enhanced resolution for smoother waves
  
  // Wave parameters with variation by index
  const wavePhaseOffset = waveIndex * (Math.PI / 8);
  const waveAmplitude = amplitude * (1 - waveIndex * 0.15);
  
  // Tremolo effect (amplitude modulation)
  const tremoloEffect = tremolo > 0 ? 1 - (tremolo * 0.5 * Math.sin(time * 5)) : 1;
  
  // Generate each point with enhanced effects
  for (let i = 0; i <= steps; i++) {
    const x = i * ((width - padding * 2) / steps) + padding;
    const normalX = i / steps;
    
    // Frequency modulation with time variation
    const modFreq = modulation > 0 
      ? frequency * (1 + modulation * 0.3 * Math.sin(time * 2 + waveIndex * 0.2)) 
      : frequency;
    
    // Calculate phase with all effects
    const totalPhase = normalX * modFreq * Math.PI * 2 + phase + wavePhaseOffset + time;
    
    // Generate base waveform
    let waveValue;
    switch(Math.floor(waveform * 4)) {
      case 1: // Square wave with smoothing
        waveValue = Math.sin(totalPhase) >= 0 ? 1 : -1;
        // Add slight smoothing to square wave corners if distortion is low
        if (distortion < 0.3 && Math.abs(Math.sin(totalPhase)) < 0.1) {
          waveValue *= Math.abs(Math.sin(totalPhase)) * 10;
        }
        break;
      case 2: // Triangle wave
        waveValue = Math.asin(Math.sin(totalPhase)) * (2/Math.PI);
        break;
      case 3: // Sawtooth wave with anti-aliasing
        const sawPhase = (totalPhase/(2*Math.PI)) - Math.floor(0.5 + totalPhase/(2*Math.PI));
        waveValue = 2 * sawPhase;
        // Add anti-aliasing to reduce jaggies
        if (Math.abs(sawPhase) > 0.45) {
          waveValue *= 0.98;
        }
        break;
      default: // Sine wave (default)
        waveValue = Math.sin(totalPhase);
    }
    
    // Apply distortion with enhanced curve
    if (distortion > 0) {
      // Use enhanced distortion algorithm with better curve shaping
      const distortionFactor = 1 + distortion * 5;
      waveValue = (Math.tanh(waveValue * distortionFactor) / Math.tanh(distortionFactor)) * (1 + distortion * 0.2);
    }
    
    // Apply harmonics with phase relationship
    if (harmonics > 0) {
      // Add third harmonic
      waveValue += harmonics * 0.3 * Math.sin(totalPhase * 3 + harmonics * 0.2);
      // Add fifth harmonic with phase offset
      waveValue += harmonics * 0.15 * Math.sin(totalPhase * 5 + harmonics * 0.4);
      // Add seventh harmonic for richer sound
      waveValue += harmonics * 0.08 * Math.sin(totalPhase * 7);
      
      // Normalize amplitude after adding harmonics
      waveValue /= (1 + harmonics * 0.53);
    }
    
    // Apply tremolo effect
    waveValue *= tremoloEffect;
    
    // Add glitch effect if enabled
    if (glitch > 0 && Math.random() < glitch * 0.005) {
      waveValue += (Math.random() * 2 - 1) * glitch * 0.1;
    }
    
    // Calculate final y position
    const y = height / 2 - waveAmplitude * waveValue;
    
    points.push(`${x},${y}`);
  }
  
  return points.join(" ");
};

/**
 * Generates wave visualization from text input
 * @param {String} text - Text to convert to wave
 * @param {HTMLCanvasElement} canvas - Canvas element for rendering
 * @param {Object} params - Additional parameters
 * @returns {Array} Array of point coordinates
 */
export const generateTextWave = (text, canvas, params = {}) => {
  if (!text || !canvas) return [];
  
  const {
    distortion = 0,
    modulation = 0,
    time = 0,
    harmonics = 0,
    colorMode = 'theme'
  } = params;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Set up font with size proportional to canvas and text length
  const fontSize = Math.min(100, width / (text.length * 0.7));
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  // Draw text (white for sampling)
  ctx.fillStyle = 'white';
  ctx.fillText(text, width / 2, height / 2);
  
  // Get pixel data
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  
  // Sample points with adaptive precision
  const points = [];
  // Use adaptive sample step - more detail for shorter text
  const sampleStep = Math.max(1, Math.min(3, Math.floor(text.length / 8)));
  
  // Scan horizontally
  for (let x = 0; x < width; x += sampleStep) {
    // For each column, scan from top to bottom
    let topY = null;
    let bottomY = null;
    
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      
      // If we find a non-transparent pixel
      if (pixels[index + 3] > 0) {
        if (topY === null) {
          topY = y;
        }
        bottomY = y;
      }
    }
    
    // If we found text in this column
    if (topY !== null) {
      points.push({ x, y: topY, edge: 'top' });
      points.push({ x, y: bottomY, edge: 'bottom' });
    }
  }
  
  // Sort points to create a continuous wave
  // Top edges left to right, then bottom edges right to left
  const sortedPoints = [
    ...points.filter(p => p.edge === 'top').sort((a, b) => a.x - b.x),
    ...points.filter(p => p.edge === 'bottom').sort((a, b) => b.x - a.x)
  ];
  
  // Apply effects to points
  return sortedPoints.map((point, index) => {
    let { x, y } = point;
    
    // Apply distortion with variation by position
    if (distortion > 0) {
      // More distortion at edges than center
      const distortFactor = 1 + Math.abs((x / width) - 0.5);
      y += (Math.random() * 2 - 1) * distortion * 10 * distortFactor;
    }
    
    // Apply modulation with phase progression
    if (modulation > 0) {
      const phaseOffset = (index / sortedPoints.length) * Math.PI * 2;
      y += Math.sin(phaseOffset + time * 2) * modulation * 20;
    }
    
    // Apply harmonics effect to make text wave more complex
    if (harmonics > 0) {
      const normalizedPos = index / sortedPoints.length;
      y += Math.sin(normalizedPos * Math.PI * 6) * harmonics * 10;
    }
    
    // For rainbow mode, adjust points to create more visual interest
    if (colorMode === 'rainbow' && index % 5 === 0) {
      const wiggle = Math.sin(index * 0.1 + time) * 2;
      y += wiggle;
    }
    
    return { x, y };
  });
};

/**
 * Advanced color generation for wave visualization
 * @param {String} theme - Base theme ('green', 'amber', 'blue')
 * @param {Number} opacity - Opacity level
 * @param {Object} params - Additional parameters
 * @returns {Object} Color information and styles
 */
export const getThemeColor = (theme, opacity = 1, params = {}) => {
  const { 
    brightness = 100, 
    glow = 0, 
    hue = 120, 
    saturation = 70, 
    colorSpread = 10, 
    waveIndex = 0, 
    colorMode = 'theme',
    pulse = 0,
    time = 0,
    glitch = 0
  } = params;
  
  // Calculate effective brightness with optional pulse effect
  let effectiveBrightness = brightness / 100;
  if (pulse > 0) {
    effectiveBrightness *= 1 + (pulse * 0.2 * Math.sin(time * 3)) * 0.1;
  }
  
  // Calculate final opacity with brightness adjustment
  const finalOpacity = opacity * Math.min(1.5, Math.max(0.2, effectiveBrightness));
  
  // Determine hue based on color mode and parameters
  let waveHue;
  
  switch (colorMode) {
    case 'rainbow':
      // Rainbow mode with smooth transitions
      waveHue = (hue + (waveIndex * 60) + time * 30) % 360;
      break;
    case 'spectrum':
      // Spectrum analyzer style - blues to reds
      waveHue = 240 - (waveIndex * 30);
      break;
    case 'theme':
      // Theme variation with subtle spread
      waveHue = (theme === 'green' ? 120 : theme === 'amber' ? 35 : theme === 'blue' ? 210 : hue) + 
                (waveIndex * colorSpread);
      break;
    default:
      // Direct hue control
      waveHue = (hue + (waveIndex * colorSpread)) % 360;
  }
  
  // Apply random hue shift for glitch effect
  if (glitch > 0 && Math.random() < glitch * 0.01) {
    waveHue = (waveHue + (Math.random() * glitch)) % 360;
  }
  
  // Convert HSL to RGB with improved algorithm
  const h = waveHue / 360;
  const s = saturation / 100;
  // Limit max brightness while preserving color vibrancy
  const l = Math.min(0.85, 0.4 + (effectiveBrightness * 0.3));
  
  const hueToRgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const r = Math.round(hueToRgb(p, q, h + 1/3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1/3) * 255);
  
  // Create CSS color strings
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
  const hslColor = `hsl(${waveHue}, ${saturation}%, ${l * 100}%)`;
  
  // Generate advanced glow effect
  let style = {};
  if (glow > 0) {
    const glowIntensity = glow * (0.05 + (effectiveBrightness * 0.05));
    const glowSpread = glow * 0.15;
    
    style = {
      filter: `drop-shadow(0 0 ${glowSpread}px rgba(${r}, ${g}, ${b}, ${0.7 * finalOpacity})) 
               drop-shadow(0 0 ${glowSpread * 2}px rgba(${r}, ${g}, ${b}, ${0.4 * finalOpacity}))`
    };
  }
  
  return {
    color: rgbaColor,
    style,
    hsl: hslColor,
    rgb: { r, g, b }
  };
};