import React, { useState, useEffect, useRef } from 'react';
import { generateTextWave } from '../Utils/WaveUtils';
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
  const [historyTexts, setHistoryTexts] = useState([]);
  const canvasRef = useRef(null);
  
  // Ajustar el tamaño del canvas cuando cambian las dimensiones
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width || 800;
      canvasRef.current.height = height || 250;
    }
  }, [width, height]);

  // Función para generar los puntos de la onda a partir del texto
  const handleGenerateWave = () => {
    if (!inputText || !powerOn || !canvasRef.current) return;
    
    setIsGenerating(true);
    
    // Generar los puntos de la onda
    const waveData = generateTextWave(
      inputText.toUpperCase(), 
      canvasRef.current, 
      {
        distortion: waveParams.distortion,
        modulation: waveParams.modulation,
        time: waveParams.time
      }
    );
    
    // Guardar el texto en el historial
    if (!historyTexts.includes(inputText)) {
      setHistoryTexts(prev => [inputText, ...prev].slice(0, 5)); // Mantener solo los últimos 5
    }
    
    // Pasar los datos al componente padre
    if (onTextWaveGenerated && waveData.length > 0) {
      onTextWaveGenerated(waveData);
    }
    
    setIsGenerating(false);
  };

  const handleInputChange = (e) => {
    // Limitar a 20 caracteres
    const value = e.target.value.slice(0, 20);
    setInputText(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleGenerateWave();
  };
  
  const handleHistoryClick = (text) => {
    setInputText(text);
    // Esperar un poco para asegurar que el estado se ha actualizado
    setTimeout(() => handleGenerateWave(), 100);
  };

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
            {isGenerating ? 'Generating...' : 'Visualize'}
          </button>
        </div>
      </form>
      
      {/* Historia de textos recientes */}
      {historyTexts.length > 0 && powerOn && (
        <div className="text-history">
          <div className="history-title">Recent:</div>
          <div className="history-items">
            {historyTexts.map((text, index) => (
              <button 
                key={index} 
                className="history-item"
                onClick={() => handleHistoryClick(text)}
                disabled={isGenerating}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
      
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