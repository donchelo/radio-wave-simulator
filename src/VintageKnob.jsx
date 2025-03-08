import React, { useEffect, useRef } from 'react';
import './VintageKnob.css';

const VintageKnob = ({ value, min, max, onChange, size = 80, label, disabled = false }) => {
  const knobRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousYRef = useRef(0);
  
  // Convertir valor a rotación (grados)
  const getRotation = () => {
    const percentage = (value - min) / (max - min);
    return percentage * 270 - 135; // -135° a 135°
  };
  
  // Registrar eventos globales una sola vez
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || disabled) return;
      
      const deltaY = previousYRef.current - e.clientY;
      previousYRef.current = e.clientY;
      
      const range = max - min;
      const sensitivity = 5; // Mayor sensibilidad
      const valueChange = (deltaY * sensitivity / 100) * range;
      const newValue = Math.max(min, Math.min(max, value + valueChange));
      
      onChange(parseFloat(newValue.toFixed(2)));
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    // Agregar eventos
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Limpiar eventos al desmontar
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [min, max, value, onChange, disabled]);
  
  const handleMouseDown = (e) => {
    if (disabled) return;
    
    // Prevenir selección de texto
    e.preventDefault();
    
    isDraggingRef.current = true;
    previousYRef.current = e.clientY;
    
    // Asegurar que el elemento tiene foco
    if (knobRef.current) {
      knobRef.current.focus();
    }
  };
  
  const handleTouchStart = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    isDraggingRef.current = true;
    previousYRef.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || disabled) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = previousYRef.current - touch.clientY;
    previousYRef.current = touch.clientY;
    
    const range = max - min;
    const sensitivity = 5;
    const valueChange = (deltaY * sensitivity / 100) * range;
    const newValue = Math.max(min, Math.min(max, value + valueChange));
    
    onChange(parseFloat(newValue.toFixed(2)));
  };
  
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };
  
  // Soporte para teclado
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    let newValue = value;
    const step = (max - min) / 100;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      newValue = Math.min(max, value + step);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      newValue = Math.max(min, value - step);
    }
    
    if (newValue !== value) {
      onChange(parseFloat(newValue.toFixed(2)));
    }
  };
  
  const rotation = getRotation();
  
  // Generar marcadores de posición
  const renderMarkers = () => {
    const markers = [];
    const markerCount = 5; // Reducido para claridad visual
    
    for (let i = 0; i < markerCount; i++) {
      const percentage = i / (markerCount - 1);
      const angle = percentage * 270 - 135; // -135° a 135°
      const radians = (angle * Math.PI) / 180;
      
      // Calcular posición del marcador
      const radius = size / 2 + 8; // Ligeramente fuera del borde del knob
      const x = Math.sin(radians) * radius;
      const y = -Math.cos(radians) * radius;
      
      markers.push(
        <div 
          key={i}
          className="knob-marker"
          style={{
            transform: `translate(${x}px, ${y}px)`,
          }}
        />
      );
    }
    
    return markers;
  };
  
  return (
    <div className="vintage-knob-container">
      <div className="knob-with-markers">
        {renderMarkers()}
        <div 
          ref={knobRef}
          className={`vintage-knob ${disabled ? 'disabled' : ''}`}
          style={{ width: size, height: size }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? '-1' : '0'}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
        >
          <div className="knob-base"></div>
          <div 
            className="knob-indicator"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          ></div>
          <div className="knob-center"></div>
        </div>
      </div>
      <div className="knob-label">{label}</div>
      <div className="knob-value">
        {value.toFixed(min === Math.floor(min) && max === Math.floor(max) ? 0 : 2)}
      </div>
    </div>
  );
};

export default VintageKnob;