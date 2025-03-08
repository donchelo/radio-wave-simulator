// Utilidades para generar y manipular ondas

// Generates points for a specific wave
export const generateWavePoints = (waveParams, waveIndex, padding = 10) => {
  const {
    amplitude,
    frequency,
    phase,
    time,
    distortion,
    harmonics,
    modulation,
    tremolo,
    waveform,
    powerOn,
    textWaveMode,
    textWaveData,
    svgDimensions
  } = waveParams;
  
  const { width, height } = svgDimensions;
  
  // Use text wave data if in text mode
  if (textWaveMode && textWaveData && textWaveData.length > 0) {
    // For multiple waves, only the first shows the text
    if (waveIndex > 0) {
      return '';
    }
    
    // Convert points to string format for polyline
    const pointsStr = textWaveData.map((point) => {
      return `${point.x},${point.y}`;
    }).join(' ');
    
    return pointsStr;
  }
  
  const points = [];
  const steps = 200; // More points for smoother waves
  
  // If powered off, show a flat line in the center
  if (!powerOn) {
    return `${padding},${height / 2} ${width - padding},${height / 2}`;
  }
  
  // Adjust phase and amplitude slightly for each wave
  const wavePhaseOffset = waveIndex * (Math.PI / 8);
  const waveAmplitude = amplitude * (1 - waveIndex * 0.15);
  
  // Tremolo effect (amplitude modulation)
  const tremoloEffect = tremolo > 0 ? 1 - (tremolo * 0.5 * Math.sin(time * 5)) : 1;
  
  // Generate each point of the wave
  for (let i = 0; i <= steps; i++) {
    const x = i * ((width - padding * 2) / steps) + padding;
    const normalX = i / steps;
    
    // Frequency modulation
    const modFreq = modulation > 0 
      ? frequency * (1 + modulation * 0.3 * Math.sin(time * 2)) 
      : frequency;
    
    // Calculate total phase with effects
    const totalPhase = normalX * modFreq * Math.PI * 2 + phase + wavePhaseOffset + time;
    
    // Select waveform based on parameter
    let waveValue;
    switch(Math.floor(waveform * 4)) {
      case 1: // Square wave
        waveValue = Math.sin(totalPhase) >= 0 ? 1 : -1;
        break;
      case 2: // Triangle wave
        waveValue = Math.asin(Math.sin(totalPhase)) * (2/Math.PI);
        break;
      case 3: // Sawtooth wave
        waveValue = (2 * (totalPhase/(2*Math.PI) - Math.floor(0.5 + totalPhase/(2*Math.PI))));
        break;
      default: // Sine wave (default)
        waveValue = Math.sin(totalPhase);
    }
    
    // Apply distortion (simulate clipping/saturation)
    if (distortion > 0) {
      waveValue = Math.tanh(waveValue * (1 + distortion * 3)) / Math.tanh(1 + distortion * 3);
    }
    
    // Apply additional harmonics
    if (harmonics > 0) {
      // Add third harmonic
      waveValue += harmonics * 0.3 * Math.sin(totalPhase * 3);
      // Add fifth harmonic
      waveValue += harmonics * 0.15 * Math.sin(totalPhase * 5);
      
      // Normalize amplitude after adding harmonics
      waveValue /= (1 + harmonics * 0.45);
    }
    
    // Apply tremolo effect (amplitude modulation)
    waveValue *= tremoloEffect;
    
    const y = height / 2 - waveAmplitude * waveValue;
    
    points.push(`${x},${y}`);
  }
  
  return points.join(" ");
};

// Function to generate text wave
export const generateTextWave = (text, canvas, params) => {
  if (!text || !canvas) return [];
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Set font
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
  
  // Sample points
  const points = [];
  const sampleStep = 2;
  
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
  
  // Sort points
  const sortedPoints = [
    ...points.filter(p => p.edge === 'top').sort((a, b) => a.x - b.x),
    ...points.filter(p => p.edge === 'bottom').sort((a, b) => b.x - a.x)
  ];
  
  // Apply distortion effects
  return sortedPoints.map((point, index) => {
    let { x, y } = point;
    
    // Apply distortion
    if (params.distortion > 0) {
      y += (Math.random() * 2 - 1) * params.distortion * 10;
    }
    
    // Apply modulation
    if (params.modulation > 0) {
      const phaseOffset = (index / sortedPoints.length) * Math.PI * 2;
      y += Math.sin(phaseOffset + params.time) * params.modulation * 20;
    }
    
    return { x, y };
  });
};

// Function to get color based on theme
export const getThemeColor = (theme, opacity = 1, brightness = 100) => {
  // Adjust brightness factor (0-100)
  const brightnessFactor = brightness / 100;
  
  switch(theme) {
    case 'green':
      return `rgba(${32 * brightnessFactor}, ${238 * brightnessFactor}, ${32 * brightnessFactor}, ${opacity})`;
    case 'amber':
      return `rgba(${255 * brightnessFactor}, ${149 * brightnessFactor}, ${0 * brightnessFactor}, ${opacity})`;
    case 'blue':
      return `rgba(${32 * brightnessFactor}, ${156 * brightnessFactor}, ${238 * brightnessFactor}, ${opacity})`;
    default:
      return `rgba(${255 * brightnessFactor}, ${255 * brightnessFactor}, ${255 * brightnessFactor}, ${opacity})`;
  }
};