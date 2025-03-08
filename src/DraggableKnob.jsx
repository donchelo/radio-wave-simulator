import React, { useRef, useState, useEffect } from 'react';

const DraggableKnob = ({ value, min, max, onChange, size = 80, label }) => {
  const knobRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startValue, setStartValue] = useState(0);
  
  // Convert value to rotation (degrees)
  const getRotation = (val) => {
    const percentage = (val - min) / (max - min);
    return percentage * 270 - 135; // -135° to 135°
  };

  // Convert mouse position to angle relative to knob center
  const getAngle = (e) => {
    const knob = knobRef.current;
    if (!knob) return 0;
    
    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    return Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  };
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    const angle = getAngle(e);
    setStartAngle(angle);
    setStartValue(value);
    setDragging(true);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseUp = () => {
    setDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const currentAngle = getAngle(e);
    let deltaAngle = currentAngle - startAngle;
    
    // Handle angle wrapping around 360 degrees
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    // Scale angle change to value change (270 degrees = full range)
    const range = max - min;
    const deltaValue = (deltaAngle / 270) * range;
    
    // Calculate new value and clamp it to the allowed range
    let newValue = startValue + deltaValue;
    newValue = Math.max(min, Math.min(max, newValue));
    
    // Update value
    onChange(parseFloat(newValue.toFixed(2)));
  };
  
  // Calculate current rotation
  const rotation = getRotation(value);
  
  return (
    <div className="vintage-knob-container" style={{ textAlign: 'center' }}>
      <div 
        ref={knobRef}
        className="vintage-knob" 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%',
          backgroundColor: '#f5f5f0',
          boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          cursor: 'grab',
          margin: '0 auto'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Indicator mark */}
        <div 
          style={{
            position: 'absolute',
            width: '3px',
            height: '40%',
            backgroundColor: '#333',
            bottom: '50%',
            left: '50%',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: 'bottom center'
          }}
        ></div>
        
        {/* Center point */}
        <div style={{
          position: 'absolute',
          width: '15%',
          height: '15%',
          backgroundColor: '#333',
          borderRadius: '50%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}></div>
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        textTransform: 'uppercase', 
        marginTop: '8px',
        fontWeight: '500',
        color: '#e8e3d5' 
      }}>{label}</div>
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#e8e3d5',
        opacity: '0.7' 
      }}>
        {(value).toFixed(min === Math.floor(min) && max === Math.floor(max) ? 0 : 2)}
      </div>
    </div>
  );
};

export default DraggableKnob;