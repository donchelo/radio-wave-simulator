import React, { useEffect, useRef, useState } from 'react';

const ModernVintageKnob = ({ 
  value, 
  min = 0, 
  max = 10, 
  onChange, 
  size = 120, 
  label,
  displayMinMax = true,
  numTicks = 11,
  color = "#333" 
}) => {
  const knobRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousYRef = useRef(0);
  
  const [knobValue, setKnobValue] = useState(value);
  
  useEffect(() => {
    setKnobValue(value);
  }, [value]);
  
  // Convertir valor a rotación (grados)
  const getRotation = () => {
    const percentage = (knobValue - min) / (max - min);
    return percentage * 270 - 135; // -135° a 135°
  };
  
  // Registrar eventos globales
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      
      const deltaY = previousYRef.current - e.clientY;
      previousYRef.current = e.clientY;
      
      const range = max - min;
      const sensitivity = 2; // Ajustar sensibilidad
      const valueChange = (deltaY * sensitivity / 100) * range;
      const newValue = Math.max(min, Math.min(max, knobValue + valueChange));
      
      setKnobValue(parseFloat(newValue.toFixed(2)));
      onChange(parseFloat(newValue.toFixed(2)));
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [min, max, knobValue, onChange]);
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    previousYRef.current = e.clientY;
  };
  
  const handleTouchStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    previousYRef.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = previousYRef.current - touch.clientY;
    previousYRef.current = touch.clientY;
    
    const range = max - min;
    const sensitivity = 2;
    const valueChange = (deltaY * sensitivity / 100) * range;
    const newValue = Math.max(min, Math.min(max, knobValue + valueChange));
    
    setKnobValue(parseFloat(newValue.toFixed(2)));
    onChange(parseFloat(newValue.toFixed(2)));
  };
  
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };
  
  const handleKeyDown = (e) => {
    let newValue = knobValue;
    const step = (max - min) / 100;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      newValue = Math.min(max, knobValue + step);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      newValue = Math.max(min, knobValue - step);
    }
    
    if (newValue !== knobValue) {
      setKnobValue(parseFloat(newValue.toFixed(2)));
      onChange(parseFloat(newValue.toFixed(2)));
    }
  };
  
  // Generar marcas de escala
  const renderTicks = () => {
    const ticks = [];
    
    for (let i = 0; i < numTicks; i++) {
      const percentage = i / (numTicks - 1);
      const angle = percentage * 270 - 135; // -135° a 135°
      const radians = (angle * Math.PI) / 180;
      
      const isMainTick = i === 0 || i === numTicks - 1 || i % Math.ceil(numTicks / 10) === 0;
      const tickLength = isMainTick ? 10 : 5;
      const tickWidth = isMainTick ? 2 : 1;
      const outerRadius = size / 2 + 5;
      const innerRadius = outerRadius - tickLength;
      
      // Calcular puntos de la línea
      const x1 = Math.sin(radians) * innerRadius;
      const y1 = -Math.cos(radians) * innerRadius;
      const x2 = Math.sin(radians) * outerRadius;
      const y2 = -Math.cos(radians) * outerRadius;
      
      // Añadir número
      const textRadius = outerRadius + 10;
      const textX = Math.sin(radians) * textRadius;
      const textY = -Math.cos(radians) * textRadius;
      
      const tickValue = min + percentage * (max - min);
      const displayValue = Number.isInteger(tickValue) 
        ? tickValue 
        : tickValue.toFixed(1);
      
      ticks.push(
        <g key={`tick-${i}`}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#aaa"
            strokeWidth={tickWidth}
            strokeLinecap="round"
          />
          {isMainTick && (
            <text
              x={textX}
              y={textY}
              fill="#aaa"
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ userSelect: 'none' }}
            >
              {displayValue}
            </text>
          )}
        </g>
      );
    }
    
    return ticks;
  };
  
  // Calcular dimensiones del SVG
  const svgSize = size + 70; // Espacio extra para marcas y texto
  const centerOffset = svgSize / 2;
  
  const rotation = getRotation();
  
  return (
    <div className="modern-knob-container" style={{ position: 'relative', width: svgSize, height: svgSize + 30 }}>
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <g transform={`translate(${centerOffset}, ${centerOffset})`}>
          {renderTicks()}
          
          {displayMinMax && (
            <>
              <text
                x={-svgSize/3}
                y={svgSize/3 - 10}
                fill="#333"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                MIN
              </text>
              <text
                x={svgSize/3}
                y={svgSize/3 - 10}
                fill="#333"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                MAX
              </text>
            </>
          )}
        </g>
      </svg>
      
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={knobValue}
      >
        <div 
          style={{
            width: '10%',
            height: '10%',
            borderRadius: '50%',
            backgroundColor: color,
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: `rotate(${rotation}deg) translate(-50%, 0)`,
            transformOrigin: '50% 100%'
          }}
        />
      </div>
      
      {label && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default ModernVintageKnob;