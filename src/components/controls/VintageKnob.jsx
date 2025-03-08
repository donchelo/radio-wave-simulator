import React, { useState, useRef, useEffect } from 'react';
import './VintageKnob.css';

const VintageKnob = ({ 
  value, 
  min, 
  max, 
  onChange, 
  size = 80, 
  label, 
  disabled = false,
  sensitivity = 1.0  // New sensitivity parameter (1.0 = default, lower = more subtle)
}) => {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [knobRotation, setKnobRotation] = useState(getRotationFromValue(value));
  const [hoverState, setHoverState] = useState(false);
  const [dragType, setDragType] = useState('rotational'); // Cambiado a 'rotational' por defecto
  
  // Convert value to rotation angle
  function getRotationFromValue(val) {
    const percentage = (val - min) / (max - min);
    return percentage * 270 - 135; // -135° to 135°
  }
  
  // Convert rotation angle to value
  function getValueFromRotation(rotation) {
    const normalizedRotation = rotation + 135;
    const percentage = normalizedRotation / 270;
    return min + percentage * (max - min);
  }

  // Update knob rotation when value changes externally
  useEffect(() => {
    setKnobRotation(getRotationFromValue(value));
  }, [value, min, max]);

  // Calculate value based on mouse/touch movement
  const calculateValueChange = (clientX, clientY) => {
    if (!knobRef.current || disabled) return value;

    const knobRect = knobRef.current.getBoundingClientRect();
    const knobCenterX = knobRect.left + knobRect.width / 2;
    const knobCenterY = knobRect.top + knobRect.height / 2;
    
    // Siempre usar el control rotacional como en ColorKnob
    const angle = Math.atan2(clientY - knobCenterY, clientX - knobCenterX) * (180 / Math.PI);
    // Convert angle to -135 to 135 range
    let newRotation = angle + 90; // Adjust to make "up" position the starting point
    if (newRotation > 180) newRotation -= 360;
    
    // Clamp to -135 to 135 range
    newRotation = Math.max(-135, Math.min(135, newRotation));
    setKnobRotation(newRotation);
    
    return getValueFromRotation(newRotation);
  };

  // Handle mouse events
  const handleMouseDown = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    const { clientX, clientY } = e;
    
    // Siempre usar modo rotacional (como una manito girando la perilla)
    setDragType('rotational');
    
    setIsDragging(true);
    setStartPosition({ x: clientX, y: clientY });
    
    // Set focus for keyboard control
    if (knobRef.current) knobRef.current.focus();
  };
  
  const handleGlobalMouseMove = (e) => {
    if (!isDragging) return;
    
    const newValue = calculateValueChange(e.clientX, e.clientY);
    
    // Solo actualizar si el valor realmente cambió
    if (newValue !== value) {
      // Redondear según el tipo de parámetro
      const roundedValue = Number.isInteger(min) && Number.isInteger(max) ? 
        Math.round(newValue) : 
        parseFloat(newValue.toFixed(2));
        
      onChange(roundedValue);
    }
    
    // Actualizar posición inicial para el siguiente movimiento
    setStartPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleGlobalMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events
  const handleTouchStart = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPosition({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newValue = calculateValueChange(touch.clientX, touch.clientY);
    
    if (newValue !== value) {
      // Redondear según el tipo de parámetro
      const roundedValue = Number.isInteger(min) && Number.isInteger(max) ? 
        Math.round(newValue) : 
        parseFloat(newValue.toFixed(2));
        
      onChange(roundedValue);
    }
    
    setStartPosition({ x: touch.clientX, y: touch.clientY });
  };

  // Keyboard control
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    let newRotation = knobRotation;
    const rotationStep = 3; // 3 grados por pulsación de tecla
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newRotation = Math.min(135, knobRotation + rotationStep);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newRotation = Math.max(-135, knobRotation - rotationStep);
        break;
      case 'Home':
        newRotation = -135; // Valor mínimo
        break;
      case 'End':
        newRotation = 135; // Valor máximo
        break;
      case 'PageUp':
        newRotation = Math.min(135, knobRotation + rotationStep * 3);
        break;
      case 'PageDown':
        newRotation = Math.max(-135, knobRotation - rotationStep * 3);
        break;
      default:
        return; // Salir para otras teclas
    }
    
    if (newRotation !== knobRotation) {
      const newValue = getValueFromRotation(newRotation);
      
      // Redondear según el tipo de parámetro
      const roundedValue = Number.isInteger(min) && Number.isInteger(max) ? 
        Math.round(newValue) : 
        parseFloat(newValue.toFixed(2));
        
      onChange(roundedValue);
      setKnobRotation(newRotation);
    }
    
    e.preventDefault(); // Prevenir el desplazamiento de la página
  };

  // Set up and clean up global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging, value]);

  // Generate position markers
  const renderMarkers = () => {
    const markers = [];
    // Reducir ligeramente la cantidad de marcadores para un diseño más limpio
    const markerCount = 7; // En lugar de 9 
    
    for (let i = 0; i < markerCount; i++) {
      const percentage = i / (markerCount - 1);
      const angle = percentage * 270 - 135; // -135° to 135°
      const radians = (angle * Math.PI) / 180;
      
      // Colocar los marcadores a una distancia uniforme de la perilla
      const radius = size / 2 + 3; // Consistente y cercano a la perilla
      const x = Math.sin(radians) * radius;
      const y = -Math.cos(radians) * radius;
      
      // Check if this marker is "active" based on current value
      const markerValue = min + percentage * (max - min);
      const isActive = value >= markerValue;
      
      // Usar el mismo sistema de coordenadas que los números
      markers.push(
        <div 
          key={i}
          className={`knob-marker ${isActive ? 'active' : ''}`}
          style={{
            transform: `translate(${x}px, ${y}px)`,
            opacity: isActive ? 0.9 : 0.5 // Mejor contraste
          }}
        />
      );
    }
    
    return markers;
  };

  // Generate number indicators like a clock
  const renderNumberIndicators = () => {
    const numbers = [];
    // Mostrar solo 3 números clave para un diseño minimalista
    const positions = [
      { percentage: 0, value: min, angle: -135 },       // Valor mínimo
      { percentage: 0.5, value: min + (max - min) / 2, angle: 0 },  // Valor medio
      { percentage: 1, value: max, angle: 135 }         // Valor máximo
    ];
    
    positions.forEach((pos, i) => {
      const radians = (pos.angle * Math.PI) / 180;
      
      // Formatear el valor según sea entero o decimal
      let numberValue = pos.value;
      
      // Formateo consistente para todos los valores
      if (Number.isInteger(min) && Number.isInteger(max)) {
        // Para rangos enteros, mostrar todos los valores como enteros
        numberValue = Math.round(numberValue);
      } else {
        // Para rangos decimales, usar siempre 1 decimal
        // Forzar el formato .0 incluso para enteros para consistencia visual
        numberValue = numberValue.toFixed(1);
      }
      
      // Calcular un radio uniforme para todos los indicadores
      const baseRadius = size / 2 + 12;
      
      // Usar un radio y offsets consistentes para todos los números
      let radius = baseRadius;
      let offsetX = 0;
      let offsetY = 0;
      
      // Ajustes específicos según la posición
      if (pos.angle === -135) { // Izquierda (mínimo)
        offsetX = -10;
      } else if (pos.angle === 135) { // Derecha (máximo)
        offsetX = 10;
      } else if (pos.angle === 0) { // Arriba (medio)
        offsetY = -10;
      }
      
      // Calcular la posición final con la misma distancia para todos
      const x = Math.sin(radians) * radius;
      const y = -Math.cos(radians) * radius;
      
      numbers.push(
        <div 
          key={i}
          className="knob-number-indicator special"
          style={{
            transform: `translate(${x + offsetX}px, ${y + offsetY}px)`,
          }}
        >
          {numberValue}
        </div>
      );
    });
    
    return numbers;
  };

  // Double-click to reset to middle value
  const handleDoubleClick = () => {
    if (disabled) return;
    
    const middleValue = min + (max - min) / 2;
    onChange(parseFloat(middleValue.toFixed(2)));
  };

  // Wheel event for additional control
  const handleWheel = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -1 : 1; // Invert direction to feel more natural
    
    // Ajuste de sensibilidad para el control rotacional
    // Un cambio pequeño en la rotación, similar a girar ligeramente la perilla
    const rotationStep = 5 * delta * sensitivity; // 5 grados por paso de rueda
    
    // Calcular nueva rotación
    const newRotation = Math.max(-135, Math.min(135, knobRotation + rotationStep));
    
    // Convertir rotación a valor
    const newValue = getValueFromRotation(newRotation);
    
    if (newValue !== value) {
      // Redondear según el tipo de parámetro
      const roundedValue = Number.isInteger(min) && Number.isInteger(max) ? 
        Math.round(newValue) : 
        parseFloat(newValue.toFixed(2));
        
      onChange(roundedValue);
      setKnobRotation(newRotation);
    }
  };

  return (
    <div className="vintage-knob-container">
      <div 
        className="knob-with-markers"
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
      >
        {renderMarkers()}
        {renderNumberIndicators()}
        <div 
          ref={knobRef}
          className={`vintage-knob ${isDragging ? 'dragging' : ''} ${hoverState ? 'hover' : ''} ${disabled ? 'disabled' : ''}`}
          style={{ width: size, height: size }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? '-1' : '0'}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
          aria-label={`${label} control`}
          data-dragtype={dragType}
        >
          <div className="knob-shadow"></div>
          <div className="knob-base"></div>
          <div 
            className="knob-indicator"
            style={{ transform: `translateX(-50%) rotate(${knobRotation}deg)` }}
          ></div>
          <div className="knob-center"></div>
          
          {/* Finger grip marks */}
          <div className="knob-grip-marks">
            {Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={index} 
                className="grip-mark"
                style={{
                  transform: `rotate(${index * 45}deg) translateY(-40%)`
                }}
              ></div>
            ))}
          </div>
          
          {/* Interactive shine effect */}
          <div className="knob-shine" style={{ 
            opacity: isDragging ? 0.7 : hoverState ? 0.5 : 0.3,
            transform: `rotate(${isDragging ? knobRotation / 2 : 0}deg)`
          }}></div>
        </div>
      </div>
      <div className="knob-label">{label}</div>
      <div className="knob-value">
        {value.toFixed(min === Math.floor(min) && max === Math.floor(max) ? 0 : 2)}
      </div>
      
      {/* Help tooltip */}
      {hoverState && !disabled && (
        <div className="knob-tooltip">
          <p>Gira la perilla con el mouse</p>
          <p>Double-click para centrar</p>
          <p>Use la rueda del mouse para ajuste fino</p>
          <p>Los números muestran el rango de valores</p>
        </div>
      )}
    </div>
  );
};

export default VintageKnob;