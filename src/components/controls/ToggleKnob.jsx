import React, { useState, useRef } from 'react';
import './ToggleKnob.css';

const ToggleKnob = ({ value, options, onChange, size = 80, label, disabled = false, highlight = false }) => {
 const knobRef = useRef(null);
 const [dragging, setDragging] = useState(false);
 const [startY, setStartY] = useState(0);
 const [startValue, setStartValue] = useState(0);
 
 // Convertir valor a rotación (grados)
 const getRotation = (val) => {
   const maxVal = options.length - 1;
   const percentage = val / maxVal;
   return percentage * 270 - 135; // -135° a 135°
 };
 
 // Manejar interacción del usuario
 const handleMouseDown = (e) => {
   if (disabled) return;
   
   setDragging(true);
   setStartY(e.clientY);
   setStartValue(value);
   
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
   if (!dragging) return;
   
   // Usar movimiento vertical para mayor precisión
   const deltaY = startY - e.clientY;
   const maxVal = options.length - 1;
   
   // Cambio de valor proporcional al movimiento vertical
   const sensitivity = 100;
   let newValue = startValue + Math.round((deltaY / sensitivity) * maxVal);
   
   // Limitar el valor al rango permitido
   newValue = Math.max(0, Math.min(maxVal, newValue));
   
   // Solo actualizar si el valor cambió
   if (newValue !== value) {
     onChange(newValue);
   }
 };
 
 // Manejo de clicks para cambiar directamente de valor
 const handleClick = () => {
   if (disabled) return;
   
   const maxVal = options.length - 1;
   const nextValue = (value + 1) % (maxVal + 1);
   onChange(nextValue);
 };
 
 // Calcular la rotación actual
 const rotation = getRotation(value);
 
 // Determinar si este es el botón de encendido para estilo especial
 const isPowerKnob = label === 'POWER';
 const isOn = isPowerKnob && value === 1;
 
 // Clases condicionales
 const knobClass = `toggle-knob ${disabled && !isPowerKnob ? 'disabled' : ''} ${isPowerKnob ? 'power-knob' : ''} ${isOn ? 'power-on' : ''}`;
 const indicatorClass = `toggle-knob-indicator ${highlight && isOn ? 'highlight' : ''}`;
 
 return (
   <div className="toggle-knob-container">
     <div 
       ref={knobRef}
       className={knobClass}
       style={{ width: size, height: size }}
       onMouseDown={handleMouseDown}
       onClick={handleClick}
     >
       {/* Base del potenciómetro */}
       <div className="toggle-knob-base"></div>
       
       {/* Marcas de posiciones */}
       {options.map((option, index) => {
         const angle = (index / (options.length - 1)) * 270 - 135;
         return (
           <div 
             key={index}
             className={`toggle-knob-mark ${index === value ? 'active' : ''}`}
             style={{ 
               transform: `rotate(${angle}deg) translateY(-${size/2}px)`,
               transformOrigin: "center bottom"
             }}
           />
         );
       })}
       
       {/* Marca indicadora */}
       <div 
         className={indicatorClass}
         style={{ 
           transform: `rotate(${rotation}deg)`,
           transformOrigin: "bottom center" 
         }}
       ></div>
       
       {/* Punto central */}
       <div className="toggle-knob-center"></div>
     </div>
     
     <div className="toggle-knob-label">{label}</div>
     <div className={`toggle-knob-value ${isOn ? 'on' : ''}`}>{options[value]}</div>
   </div>
 );
};

export default ToggleKnob;