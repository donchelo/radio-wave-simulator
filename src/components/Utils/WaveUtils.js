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
    const steps = 100;
    
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