// Utilidades para generar y manipular ondas

// Genera los puntos para una onda específica
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
    svgDimensions,
    // Nuevos parámetros
    noise,
    glitch,
    echo
  } = waveParams;
  
  const { width, height } = svgDimensions;
  
  // Si estamos en modo de onda de texto y hay datos disponibles, usamos esos
  if (textWaveMode && textWaveData.length > 0) {
    // Si el índice es 0, dibujamos la onda principal
    if (waveIndex === 0) {
      // Aplicar efectos de glitch y ruido a los puntos del texto
      let modifiedPoints = textWaveData.map(point => {
        let x = point.x;
        let y = point.y;
        
        // Aplicar glitch (desplazamientos horizontales aleatorios)
        if (glitch > 0 && Math.random() < glitch * 0.1) {
          const glitchAmount = (Math.random() * 2 - 1) * glitch * 5;
          x += glitchAmount;
        }
        
        // Aplicar ruido (desplazamientos verticales aleatorios)
        if (noise > 0) {
          const noiseAmount = (Math.random() * 2 - 1) * noise * 0.8;
          y += noiseAmount;
        }
        
        return `${x},${y}`;
      }).join(' ');
      
      return modifiedPoints;
    } 
    // Si el índice es 1 y hay eco, dibujamos la onda eco
    else if (waveIndex === 1 && echo > 0) {
      // Versión "eco" para mostrar una versión atenuada/retrasada
      const echoPoints = textWaveData.map(point => {
        // Aplicar desplazamiento de fase para el eco
        const echoDelay = echo * 5;
        const x = Math.max(padding, Math.min(width - padding, point.x - echoDelay));
        const y = point.y + (Math.random() * 2 - 1) * echo * 0.5;
        
        return `${x},${y}`;
      }).join(' ');
      
      return echoPoints;
    }
    
    // Para los demás índices, no mostramos nada en modo texto
    return '';
  }
  
  const points = [];
  const steps = 200; // Aumentado para mayor suavidad
  
  // Si está apagado, mostrar una línea plana en el centro
  if (!powerOn) {
    return `${padding},${height / 2} ${width - padding},${height / 2}`;
  }
  
  // Generación de ondas de eco (para índices mayores al waveCount original)
  const isEchoWave = waveIndex >= waveParams.waveCount && echo > 0;
  const echoIndex = waveIndex - waveParams.waveCount;
  
  // Determinar el índice de onda real o de eco
  const actualWaveIndex = isEchoWave ? echoIndex % waveParams.waveCount : waveIndex;
  
  // Ajusta la fase y la amplitud para cada onda
  const wavePhaseOffset = actualWaveIndex * (Math.PI / 8);
  
  // Reducir amplitud para ondas normales según su índice y para ecos
  let waveAmplitude;
  if (isEchoWave) {
    // Las ondas de eco tienen amplitud reducida basada en el valor de eco
    const echoReduction = 1 - echo * 0.4;
    waveAmplitude = amplitude * (1 - actualWaveIndex * 0.15) * echoReduction;
  } else {
    // Ondas normales
    waveAmplitude = amplitude * (1 - actualWaveIndex * 0.15);
  }
  
  // Efecto de tremolo (modulación de amplitud)
  const tremoloEffect = tremolo > 0 ? 1 - (tremolo * 0.5 * Math.sin(time * 5)) : 1;
  
  // Genera cada punto de la onda
  for (let i = 0; i <= steps; i++) {
    let x = i * ((width - padding * 2) / steps) + padding;
    const normalX = i / steps;
    
    // Aplicar glitch (desplazamientos horizontales aleatorios y esporádicos)
    if (glitch > 0 && Math.random() < glitch * 0.02) {
      const glitchOffset = (Math.random() * 2 - 1) * glitch * 5;
      x += glitchOffset;
    }
    
    // Modulación de frecuencia
    const modFreq = modulation > 0 
      ? frequency * (1 + modulation * 0.3 * Math.sin(time * 2)) 
      : frequency;
    
    // Retraso de fase para ondas de eco
    const echoPhaseDelay = isEchoWave ? (echoIndex + 1) * echo * 0.2 : 0;
    
    // Calcular la fase total con efectos
    const totalPhase = normalX * modFreq * Math.PI * 2 + phase + wavePhaseOffset + time - echoPhaseDelay;
    
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
    
    // Calcular posición Y base
    let y = height / 2 - waveAmplitude * waveValue;
    
    // Aplicar ruido (pequeñas variaciones aleatorias)
    if (noise > 0) {
      const noiseAmount = (Math.random() * 2 - 1) * noise * 0.8;
      y += noiseAmount;
    }
    
    points.push(`${x},${y}`);
  }
  
  return points.join(" ");
};

// Función auxiliar para calcular colores basados en el tema actual
export const getThemeColor = (theme, opacity = 1, brightness = 100) => {
  // Ajustar la luminosidad basada en el brillo
  const luminosityFactor = brightness / 100;
  
  switch(theme) {
    case 'green':
      return `rgba(${Math.min(255, 32 * luminosityFactor)}, ${Math.min(255, 238 * luminosityFactor)}, ${Math.min(255, 32 * luminosityFactor)}, ${opacity})`;
    case 'amber':
      return `rgba(${Math.min(255, 255 * luminosityFactor)}, ${Math.min(255, 149 * luminosityFactor)}, ${Math.min(255, 0 * luminosityFactor)}, ${opacity})`;
    case 'blue':
      return `rgba(${Math.min(255, 32 * luminosityFactor)}, ${Math.min(255, 156 * luminosityFactor)}, ${Math.min(255, 238 * luminosityFactor)}, ${opacity})`;
    default:
      return `rgba(${Math.min(255, 255 * luminosityFactor)}, ${Math.min(255, 255 * luminosityFactor)}, ${Math.min(255, 255 * luminosityFactor)}, ${opacity})`;
  }
};

// Función para generar texto a forma de onda
export const generateTextWave = (text, canvas, params) => {
  if (!text || !canvas) return [];
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);
  
  // Configurar fuente
  const fontSize = Math.min(100, width / (text.length * 0.7));
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  // Dibujar texto (blanco para muestreo)
  ctx.fillStyle = 'white';
  ctx.fillText(text, width / 2, height / 2);
  
  // Obtener datos de píxeles
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  
  // Muestrear puntos
  const points = [];
  const sampleStep = 2;
  
  // Recorrer horizontalmente
  for (let x = 0; x < width; x += sampleStep) {
    // Para cada columna, escanear de arriba a abajo
    let topY = null;
    let bottomY = null;
    
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      
      // Si encontramos un píxel no transparente
      if (pixels[index + 3] > 0) {
        if (topY === null) {
          topY = y;
        }
        bottomY = y;
      }
    }
    
    // Si encontramos texto en esta columna
    if (topY !== null) {
      points.push({ x, y: topY, edge: 'top' });
      points.push({ x, y: bottomY, edge: 'bottom' });
    }
  }
  
  // Ordenar los puntos
  const sortedPoints = [
    ...points.filter(p => p.edge === 'top').sort((a, b) => a.x - b.x),
    ...points.filter(p => p.edge === 'bottom').sort((a, b) => b.x - a.x)
  ];
  
  // Aplicar efectos a los puntos
  return sortedPoints.map((point, index) => {
    let { x, y } = point;
    
    // Aplicar distorsión
    if (params.distortion > 0) {
      y += (Math.random() * 2 - 1) * params.distortion * 10;
    }
    
    // Aplicar modulación
    if (params.modulation > 0) {
      const phaseOffset = (index / sortedPoints.length) * Math.PI * 2;
      y += Math.sin(phaseOffset + params.time) * params.modulation * 20;
    }
    
    // Aplicar glitch
    if (params.glitch > 0 && Math.random() < params.glitch * 0.05) {
      const glitchAmount = (Math.random() * 2 - 1) * params.glitch * 8;
      x += glitchAmount;
    }
    
    // Aplicar ruido
    if (params.noise > 0) {
      const noiseAmount = (Math.random() * 2 - 1) * params.noise * 2;
      y += noiseAmount;
    }
    
    return { x, y };
  });
};