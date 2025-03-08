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
    svgDimensions
  } = waveParams;
  
  const { width, height } = svgDimensions;
  
  // Si estamos en modo de onda de texto y hay datos disponibles, usamos esos
  if (textWaveMode && textWaveData.length > 0) {
    // Para evitar demasiadas ondas superpuestas en modo texto
    if (waveIndex > 0) {
      // Solo mostramos una capa para las ondas de texto
      return '';
    }
    
    // Convertir puntos a formato string para polyline
    const pointsStr = textWaveData.map((point) => {
      return `${point.x},${point.y}`;
    }).join(' ');
    
    return pointsStr;
  }
  
  const points = [];
  const steps = 200; // Aumentado para mayor suavidad
  
  // Si está apagado, mostrar una línea plana en el centro
  if (!powerOn) {
    return `${padding},${height / 2} ${width - padding},${height / 2}`;
  }
  
  // Ajusta la fase y la amplitud ligeramente para cada onda
  const wavePhaseOffset = waveIndex * (Math.PI / 8);
  const waveAmplitude = amplitude * (1 - waveIndex * 0.15);
  
  // Efecto de tremolo (modulación de amplitud)
  const tremoloEffect = tremolo > 0 ? 1 - (tremolo * 0.5 * Math.sin(time * 5)) : 1;
  
  // Genera cada punto de la onda
  for (let i = 0; i <= steps; i++) {
    const x = i * ((width - padding * 2) / steps) + padding;
    const normalX = i / steps;
    
    // Modulación de frecuencia
    const modFreq = modulation > 0 
      ? frequency * (1 + modulation * 0.3 * Math.sin(time * 2)) 
      : frequency;
    
    // Calcular la fase total con efectos
    const totalPhase = normalX * modFreq * Math.PI * 2 + phase + wavePhaseOffset + time;
    
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
    
    const y = height / 2 - waveAmplitude * waveValue;
    
    points.push(`${x},${y}`);
  }
  
  return points.join(" ");
};

// Función auxiliar para calcular colores basados en el tema actual
export const getThemeColor = (theme, opacity = 1) => {
  switch(theme) {
    case 'green':
      return `rgba(32, 238, 32, ${opacity})`;
    case 'amber':
      return `rgba(255, 149, 0, ${opacity})`;
    case 'blue':
      return `rgba(32, 156, 238, ${opacity})`;
    default:
      return `rgba(255, 255, 255, ${opacity})`;
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
  
  // Aplicar efectos de distorsión
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
    
    return { x, y };
  });
};