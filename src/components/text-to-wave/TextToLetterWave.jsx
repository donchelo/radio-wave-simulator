import React, { useState, useEffect, useRef } from 'react';
import './TextToLetterWave.css';

const TextToLetterWave = ({ 
  waveParams, 
  onTextWaveGenerated, 
  powerOn, 
  width, 
  height 
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);
  
  // Función para generar los puntos de la onda a partir del texto renderizado
  const generateWaveFromText = () => {
    if (!inputText || !powerOn || !canvasRef.current) return [];
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Limpiamos el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configuramos la fuente - más grande para mejor detección
    const fontSize = Math.min(100, canvas.width / (inputText.length * 0.7));
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Medimos el ancho del texto
    const textMetrics = ctx.measureText(inputText);
    const textWidth = textMetrics.width;
    
    // Centramos el texto en el canvas
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // Dibujamos el texto (invisible, solo para muestreo)
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(inputText, x, y);
    
    // Obtenemos los datos de píxeles
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Muestreamos puntos a lo largo del texto
    const points = [];
    const sampleStep = 2; // Muestrear cada 2 píxeles para más detalle
    
    // Recorremos horizontalmente el canvas
    for (let scanX = 0; scanX < canvas.width; scanX += sampleStep) {
      // Para cada columna, escaneamos de arriba a abajo
      let foundTop = false;
      let topY = 0;
      let bottomY = 0;
      
      for (let scanY = 0; scanY < canvas.height; scanY++) {
        const index = (scanY * canvas.width + scanX) * 4;
        
        // Si encontramos un píxel no transparente (parte del texto)
        if (pixels[index + 3] > 0) {
          if (!foundTop) {
            // Primer píxel del texto encontrado (borde superior)
            foundTop = true;
            topY = scanY;
          }
          // Seguimos actualizando el borde inferior
          bottomY = scanY;
        }
      }
      
      // Si encontramos texto en esta columna
      if (foundTop) {
        // Añadimos puntos tanto para el borde superior como para el inferior
        points.push({ 
          x: scanX, 
          y: topY,
          edge: 'top'
        });
        
        points.push({ 
          x: scanX, 
          y: bottomY,
          edge: 'bottom'
        });
      }
    }
    
    // Ordenamos los puntos para crear una onda continua
    // Primero todos los puntos del borde superior (de izquierda a derecha)
    // Luego todos los puntos del borde inferior (de derecha a izquierda)
    const sortedPoints = [
      ...points.filter(p => p.edge === 'top').sort((a, b) => a.x - b.x),
      ...points.filter(p => p.edge === 'bottom').sort((a, b) => b.x - a.x)
    ];
    
    // Aplicamos los efectos de onda
    const modifiedPoints = sortedPoints.map((point, index) => {
      let x = point.x;
      let y = point.y;
      
      // Aplicar modulación
      if (waveParams.modulation > 0) {
        const phaseOffset = (index / sortedPoints.length) * Math.PI * 2;
        y += Math.sin(phaseOffset) * waveParams.modulation * 20;
      }
      
      // Aplicar distorsión
      if (waveParams.distortion > 0) {
        y += (Math.random() * 2 - 1) * waveParams.distortion * 10;
      }
      
      // Aplicar tremolo (variación de amplitud)
      if (waveParams.tremolo > 0) {
        const centerY = canvas.height / 2;
        y = centerY + (y - centerY) * (1 + Math.sin(index * 0.1) * waveParams.tremolo * 0.5);
      }
      
      return { x, y };
    });
    
    setIsGenerating(false);
    return modifiedPoints;
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const waveData = generateWaveFromText();
    
    // Pasamos los datos al componente padre
    if (onTextWaveGenerated && waveData.length > 0) {
      onTextWaveGenerated(waveData);
    }
  };

  // Ajustamos el tamaño del canvas cuando cambia el tamaño del contenedor
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width || 800;
      canvasRef.current.height = height || 250;
    }
  }, [width, height]);

  return (
    <div className={`text-to-letter-wave ${!powerOn ? 'powered-off' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="text-input-container">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type text to visualize as waveform..."
            disabled={!powerOn || isGenerating}
            className="wave-text-input"
            maxLength="20"
          />
          <button 
            type="submit" 
            disabled={!powerOn || !inputText || isGenerating}
            className="generate-wave-btn"
          >
            {isGenerating ? 'Generating...' : 'Visualize Text'}
          </button>
        </div>
      </form>
      
      {/* Canvas oculto usado para renderizar y muestrear el texto */}
      <canvas 
        ref={canvasRef} 
        className="hidden-canvas"
        width={width || 800} 
        height={height || 250}
      />
      
      {inputText && (
        <div className="text-wave-info">
          <span>Text: "{inputText}"</span>
          <span className="text-length">{inputText.length} characters</span>
        </div>
      )}
    </div>
  );
};

export default TextToLetterWave;