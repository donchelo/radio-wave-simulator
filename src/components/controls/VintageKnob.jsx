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
  const [dragType, setDragType] = useState('vertical'); // 'vertical' or 'rotational'
  
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
    
    if (dragType === 'rotational') {
      // Rotational control (like turning an actual knob)
      const angle = Math.atan2(clientY - knobCenterY, clientX - knobCenterX) * (180 / Math.PI);
      // Convert angle to -135 to 135 range
      let newRotation = angle + 90; // Adjust to make "up" position the starting point
      if (newRotation > 180) newRotation -= 360;
      
      // Clamp to -135 to 135 range
      newRotation = Math.max(-135, Math.min(135, newRotation));
      setKnobRotation(newRotation);
      
      return getValueFromRotation(newRotation);
    } 
    else {
      // Vertical movement (more precise)
      const deltaY = startPosition.y - clientY;
      
      // Apply sensitivity factor (lower = more subtle movement)
      const adjustedDeltaY = deltaY * sensitivity;
      
      // Scale sensitivity based on range size
      const range = max - min;
      const valueChange = (adjustedDeltaY / 200) * range;
      
      // Calculate new value and clamp it
      const newValue = Math.max(min, Math.min(max, value + valueChange));
      
      // Update knob rotation for visual feedback
      setKnobRotation(getRotationFromValue(newValue));
      
      return newValue;
    }
  };

  // Handle mouse events
  const handleMouseDown = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    const { clientX, clientY } = e;
    
    // Determine drag type based on modifier keys
    setDragType(e.altKey ? 'rotational' : 'vertical');
    
    setIsDragging(true);
    setStartPosition({ x: clientX, y: clientY });
    
    // Set focus for keyboard control
    if (knobRef.current) knobRef.current.focus();
  };
  
  const handleGlobalMouseMove = (e) => {
    if (!isDragging) return;
    
    const newValue = calculateValueChange(e.clientX, e.clientY);
    
    // Only update if value actually changed
    if (newValue !== value) {
      // Round to 2 decimal places for smoother updates
      onChange(parseFloat(newValue.toFixed(2)));
    }
    
    // Update start position for next movement calculation
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
      onChange(parseFloat(newValue.toFixed(2)));
    }
    
    setStartPosition({ x: touch.clientX, y: touch.clientY });
  };

  // Keyboard control
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    let newValue = value;
    const step = (max - min) / 100; // 100 steps for fine control
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newValue = Math.max(min, value - step);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      case 'PageUp':
        newValue = Math.min(max, value + step * 10);
        break;
      case 'PageDown':
        newValue = Math.max(min, value - step * 10);
        break;
      default:
        return; // Exit for other keys
    }
    
    if (newValue !== value) {
      onChange(parseFloat(newValue.toFixed(2)));
      setKnobRotation(getRotationFromValue(newValue));
    }
    
    e.preventDefault(); // Prevent page scrolling
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
    const markerCount = 9; // More markers for better visual feedback
    
    for (let i = 0; i < markerCount; i++) {
      const percentage = i / (markerCount - 1);
      const angle = percentage * 270 - 135; // -135° to 135°
      const radians = (angle * Math.PI) / 180;
      
      // Calculate marker position
      const radius = size / 2 + 4;
      const x = Math.sin(radians) * radius;
      const y = -Math.cos(radians) * radius;
      
      // Check if this marker is "active" based on current value
      const markerValue = min + percentage * (max - min);
      const isActive = value >= markerValue;
      
      markers.push(
        <div 
          key={i}
          className={`knob-marker ${isActive ? 'active' : ''}`}
          style={{
            transform: `translate(${x}px, ${y}px)`,
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
      if (Number.isInteger(min) && Number.isInteger(max)) {
        numberValue = Math.round(numberValue);
      } else {
        // Para rangos decimales, limitar a 1 decimal
        numberValue = parseFloat(numberValue.toFixed(1));
      }
      
      // Ajustar la posición para mejor alineación
      const radius = size / 2 + 18;
      const x = Math.sin(radians) * radius;
      const y = -Math.cos(radians) * radius;
      
      // Ajuste adicional para mejorar la alineación del texto
      let offsetX = 0;
      let offsetY = 0;
      
      // Ajustes específicos según la posición
      if (pos.angle === -135) {
        offsetX = -7; // Ajustar el número de la izquierda
        offsetY = -3;
      } else if (pos.angle === 135) {
        offsetX = 7; // Ajustar el número de la derecha
        offsetY = -3;
      } else if (pos.angle === 0) {
        offsetY = -10; // Ajustar el número superior
      }
      
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
    const step = (max - min) / 100 * delta * sensitivity;
    const newValue = Math.max(min, Math.min(max, value + step));
    
    if (newValue !== value) {
      onChange(parseFloat(newValue.toFixed(2)));
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
          <p>Drag up/down for precision</p>
          <p>Hold ALT to rotate like real knob</p>
          <p>Double-click to center</p>
          <p>Use mouse wheel for fine tuning</p>
          <p>Numbers show the value range</p>
        </div>
      )}
    </div>
  );
};

export default VintageKnob;