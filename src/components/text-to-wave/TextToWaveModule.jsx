import React, { useState, useEffect } from 'react';
import './TextToWaveModule.css';

const TextToWaveModule = ({ 
  waveParams, 
  onTextWaveGenerated, 
  powerOn, 
  width, 
  height 
}) => {
  const [inputText, setInputText] = useState('');
  const [waveData, setWaveData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Convert text to waveform data
  const generateWaveFromText = (text) => {
    if (!text || !powerOn) return [];
    
    setIsGenerating(true);
    
    // Convert text to numeric values
    const textValues = [];
    
    // For each character in the text, generate amplitude values
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      
      // Get a normalized value between 0 and 1 based on character code
      // ASCII values typically range from 32-126 for printable chars
      const normalizedValue = (charCode - 32) / (126 - 32);
      
      // Generate multiple points per character for a smoother wave
      const pointsPerChar = 10;
      for (let j = 0; j < pointsPerChar; j++) {
        // Apply waveform type to the base value
        let value;
        const phase = (j / pointsPerChar) * Math.PI * 2;
        
        // Aplicar el valor basado en posición (para hacer una curva a través del texto)
        const positionFactor = Math.sin((i / text.length) * Math.PI);
        
        // Apply different wave types based on waveform parameter
        switch(Math.floor(waveParams.waveform * 4)) {
          case 1: // Square
            value = normalizedValue * (Math.sin(phase) >= 0 ? 1 : -1);
            break;
          case 2: // Triangle
            value = normalizedValue * Math.asin(Math.sin(phase)) * (2/Math.PI);
            break;
          case 3: // Sawtooth
            value = normalizedValue * (2 * (phase/(2*Math.PI) - Math.floor(0.5 + phase/(2*Math.PI))));
            break;
          default: // Sine
            value = normalizedValue * Math.sin(phase);
        }
        
        // Apply position factor to create a wave shape across all characters
        value = value * (0.5 + 0.5 * positionFactor);
        
        // Apply distortion if set
        if (waveParams.distortion > 0) {
          value = Math.tanh(value * (1 + waveParams.distortion * 3)) / Math.tanh(1 + waveParams.distortion * 3);
        }
        
        // Apply harmonics if set
        if (waveParams.harmonics > 0) {
          value += waveParams.harmonics * 0.3 * normalizedValue * Math.sin(phase * 3);
          value += waveParams.harmonics * 0.15 * normalizedValue * Math.sin(phase * 5);
          value /= (1 + waveParams.harmonics * 0.45);
        }
        
        textValues.push(value);
      }
    }
    
    // Generate wave points for SVG
    const points = [];
    const totalPoints = textValues.length;
    
    // If no text was entered, return empty array
    if (totalPoints === 0) {
      setIsGenerating(false);
      return [];
    }
    
    // Calculate points for drawing the wave
    for (let i = 0; i < totalPoints; i++) {
      const x = i * ((width - 20) / totalPoints) + 10;
      
      // Apply amplitude and center vertically
      // Amplificamos el efecto para que se vea mejor
      const amplitudeFactor = waveParams.amplitude * 2;
      const y = (height / 2) - (textValues[i] * amplitudeFactor);
      
      points.push({ x, y });
    }
    
    console.log(`Generated ${points.length} points for text wave`);
    
    setIsGenerating(false);
    return points;
  };

  // Regenerate wave data when text or parameters change
  // Solo regeneramos la onda cuando cambian los parámetros de onda, no cada vez que cambia el inputText
  useEffect(() => {
    if (inputText) {
      const data = generateWaveFromText(inputText);
      setWaveData(data);
      
      // Pass the wave data to parent component
      if (onTextWaveGenerated) {
        onTextWaveGenerated(data);
      }
    }
  }, [waveParams, powerOn, width, height]);
  
  // Efecto separado para el inputText, para que no sea tan sensible
  useEffect(() => {
    if (inputText) {
      const data = generateWaveFromText(inputText);
      setWaveData(data);
      
      // Pass the wave data to parent component
      if (onTextWaveGenerated) {
        onTextWaveGenerated(data);
      }
    }
  }, [inputText]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Multiplicamos la amplitud para que sea más visible
    const adjustedParams = {
      ...waveParams,
      amplitude: waveParams.amplitude * 1.5
    };
    
    const data = generateWaveFromText(inputText);
    setWaveData(data);
    
    // Pass the wave data to parent component
    if (onTextWaveGenerated) {
      onTextWaveGenerated(data);
    }
    
    // Log para depuración
    console.log("Generated wave data:", data.length > 0 ? "Data available" : "No data");
  };

  return (
    <div className={`text-to-wave-module ${!powerOn ? 'powered-off' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="text-input-container">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type text to generate wave..."
            disabled={!powerOn || isGenerating}
            className="wave-text-input"
            maxLength="50"
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
      
      {inputText && (
        <div className="text-wave-info">
          <span>Text: "{inputText}"</span>
          <span className="text-length">{inputText.length} characters</span>
        </div>
      )}
    </div>
  );
};

export default TextToWaveModule;