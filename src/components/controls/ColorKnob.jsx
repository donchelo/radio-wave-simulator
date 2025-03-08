import React, { useState, useRef, useEffect } from 'react';
import './ColorKnob.css';

const ColorKnob = ({ 
  value, 
  min, 
  max, 
  onChange, 
  size = 80, 
  label, 
  disabled = false,
  sensitivity = 1.0  // Adjust sensitivity (lower = more subtle)
}) => {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [knobRotation, setKnobRotation] = useState(getRotationFromValue(value));
  const [hoverState, setHoverState] = useState(false);
  
  // Get color based on value (useful for hue knobs)
  const getHueColor = () => {
    // Normalize value to 0-360 range if it represents hue
    const hue = min === 0 && max === 359 ? value : (value - min) / (max - min) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  };
  
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
    
    // Use rotational control for color
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
      // Round to integers for hue, otherwise 2 decimal places
      const roundedValue = min === 0 && max === 359 ? 
        Math.round(newValue) : 
        parseFloat(newValue.toFixed(2));
        
      onChange(roundedValue);
    }
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
      const roundedValue = min === 0 && max === 359 ? 
        Math.round(newValue) : 
        parseFloat(newValue.toFixed(2));
        
      onChange(roundedValue);
    }
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
      default:
        return; // Exit for other keys
    }
    
    if (newValue !== value) {
      const roundedValue = min === 0 && max === 359 ? 
        Math.round(newValue) : 
        parseFloat(newValue.toFixed(2));
        
      onChange(roundedValue);
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

  // Generate color markers around the knob
  const renderColorMarkers = () => {
    const markers = [];
    const markerCount = 12; // More color markers for smoother appearance
    
    for (let i = 0; i < markerCount; i++) {
      const percentage = i / markerCount;
      const angle = percentage * 270 - 135; // -135° to 135°
      const radians = (angle * Math.PI) / 180;
      
      // Calculate marker position
      const radius = size / 2 + 4;
      const x = Math.sin(radians) * radius;
      const y = -Math.cos(radians) * radius;
      
      // Calculate color for this marker
      const markerValue = min + percentage * (max - min);
      const hue = min === 0 && max === 359 ? markerValue : (markerValue - min) / (max - min) * 360;
      
      markers.push(
        <div 
          key={i}
          className="color-knob-marker"
          style={{
            transform: `translate(${x}px, ${y}px)`,
            backgroundColor: `hsl(${hue}, 70%, 50%)`,
            boxShadow: value >= markerValue ? `0 0 5px hsl(${hue}, 70%, 50%)` : 'none'
          }}
        />
      );
    }
    
    return markers;
  };

  // Double-click to reset to default value
  const handleDoubleClick = () => {
    if (disabled) return;
    
    // Reset to halfway for color knobs
    const defaultValue = min + (max - min) / 2;
    onChange(min === 0 && max === 359 ? Math.round(defaultValue) : parseFloat(defaultValue.toFixed(2)));
  };

  return (
    <div className="color-knob-container">
      <div 
        className="knob-with-markers"
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
      >
        {renderColorMarkers()}
        <div 
          ref={knobRef}
          className={`color-knob ${isDragging ? 'dragging' : ''} ${hoverState ? 'hover' : ''} ${disabled ? 'disabled' : ''}`}
          style={{ width: size, height: size }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? '-1' : '0'}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
          aria-label={`${label} control`}
        >
          <div className="knob-shadow"></div>
          <div 
            className="knob-base"
            style={{ 
              background: `radial-gradient(circle at 30% 30%, ${getHueColor()}, #333)` 
            }}
          ></div>
          <div 
            className="knob-indicator"
            style={{ 
              transform: `translateX(-50%) rotate(${knobRotation}deg)`,
              backgroundColor: '#fff'
            }}
          ></div>
          <div 
            className="knob-center"
            style={{ 
              background: getHueColor(),
              boxShadow: isDragging ? `0 0 10px ${getHueColor()}` : 'none'
            }}
          ></div>
          
          {/* Interactive shine effect */}
          <div className="knob-shine" style={{ 
            opacity: isDragging ? 0.7 : hoverState ? 0.5 : 0.3,
            transform: `rotate(${isDragging ? knobRotation / 2 : 0}deg)`
          }}></div>
        </div>
      </div>
      <div className="knob-label">{label}</div>
      <div className="knob-value" style={{ color: getHueColor() }}>
        {value.toFixed(min === Math.floor(min) && max === Math.floor(max) ? 0 : 2)}
      </div>
    </div>
  );
};

export default ColorKnob;