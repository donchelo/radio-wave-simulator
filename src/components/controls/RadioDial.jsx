import React, { useRef, useState } from 'react';
import './RadioDial.css';

// Componente de dial de radio simplificado
const RadioDial = ({ frequency, setFrequency }) => {
  const dialRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  
  const minFreq = 0.5;
  const maxFreq = 5;
  const range = maxFreq - minFreq;
  
  const handleMouseDown = (e) => {
    setDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };
  
  const handleMouseUp = () => {
    setDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    if (!dragging || !dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newFreq = minFreq + (relativeX * range);
    setFrequency(parseFloat(newFreq.toFixed(2)));
  };
  
  const needlePosition = ((frequency - minFreq) / range) * 100;
  
  return (
    <div className="radio-dial-container">
      <div 
        ref={dialRef}
        className="radio-dial"
        onMouseDown={handleMouseDown}
      >
        {/* Fondo del dial */}
        <div className="dial-background"></div>
        
        {/* Escala simplificada */}
        <div className="dial-scale">
          {[0.5, 1, 2, 3, 4, 5].map(freq => (
            <span key={freq} className="scale-mark">{freq}</span>
          ))}
          <span className="scale-unit">Hz</span>
        </div>
        
        {/* Línea del dial */}
        <div className="dial-line"></div>
        
        {/* Indicador del dial */}
        <div 
          className="dial-needle" 
          style={{ left: `calc(${needlePosition}% + 16px - 2px)` }}
        ></div>
      </div>
    </div>
  );
};

export default RadioDial;