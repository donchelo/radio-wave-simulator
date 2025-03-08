import React, { useState, useEffect } from 'react';

const VintageKnob = ({ value, min, max, onChange, size = 80, label }) => {
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  
  // Convert value to rotation (degrees)
  const getRotation = (val) => {
    const percentage = (val - min) / (max - min);
    return percentage * 270 - 135; // -135° to 135°
  };
  
  // Handle user interaction
  const handleMouseDown = (e) => {
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
    
    // Use vertical movement for precision
    const deltaY = startY - e.clientY;
    const range = max - min;
    
    // Change value proportional to vertical movement
    // Sensitivity: 200px movement = full range change
    const sensitivity = 200;
    const newValue = startValue + (deltaY / sensitivity) * range;
    
    // Limit value to allowed range
    const clampedValue = Math.max(min, Math.min(max, newValue));
    
    // Update value
    onChange(parseFloat(clampedValue.toFixed(2)));
  };
  
  // Calculate current rotation
  const rotation = getRotation(value);
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
      >
        {/* Knob base (vintage white) */}
        <div className="absolute w-full h-full rounded-full bg-gray-50 shadow-inner"></div>
        
        {/* Indicator mark */}
        <div 
          className="absolute w-1 h-2/5 bg-gray-800 bottom-1/2 left-1/2"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, transformOrigin: 'bottom center' }}
        ></div>
        
        {/* Center point */}
        <div className="absolute w-3 h-3 bg-gray-800 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      <div className="text-xs uppercase font-medium mt-2 text-gray-200">{label}</div>
      <div className="text-xs text-gray-300 opacity-70">
        {(value).toFixed(min === Math.floor(min) && max === Math.floor(max) ? 0 : 2)}
      </div>
    </div>
  );
};

const RetroWaveKnobPanel = () => {
  // States to control wave parameters
  const [amplitude, setAmplitude] = useState(50);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const [waveCount, setWaveCount] = useState(3);
  const [distortion, setDistortion] = useState(0);
  const [harmonics, setHarmonics] = useState(0);
  const [modulation, setModulation] = useState(0);
  const [tremolo, setTremolo] = useState(0);
  const [waveform, setWaveform] = useState(0);
  const [time, setTime] = useState(0);
  
  // Animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => (prevTime + 0.1) % 100);
    }, 50);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get waveform name based on value
  const getWaveformName = () => {
    const index = Math.floor(waveform * 4);
    const names = ["SINE WAVE", "SQUARE WAVE", "TRIANGLE WAVE", "SAWTOOTH WAVE"];
    return names[index] || names[0];
  };

  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-4xl">
      <div className="text-center mb-6">
        <h2 className="text-xl text-gray-200 font-bold tracking-wider">WAVE SIMULATOR</h2>
      </div>
      
      {/* Wave display placeholder */}
      <div className="bg-gray-800 h-32 rounded-md mb-8 overflow-hidden">
        {/* We'd render the actual wave visualization here */}
      </div>
      
      {/* Top row of knobs */}
      <div className="flex justify-between mb-8">
        <VintageKnob 
          value={amplitude} 
          min={10} 
          max={150} 
          onChange={setAmplitude} 
          size={70}
          label="VOLUME"
        />
        
        <VintageKnob 
          value={waveform} 
          min={0} 
          max={0.99} 
          onChange={setWaveform} 
          size={70}
          label="WAVEFORM"
        />
        
        <VintageKnob 
          value={distortion} 
          min={0} 
          max={1} 
          onChange={setDistortion} 
          size={70}
          label="DISTORTION"
        />
        
        <VintageKnob 
          value={waveCount} 
          min={1} 
          max={5} 
          onChange={(val) => setWaveCount(Math.floor(val))} 
          size={70}
          label="LAYERS"
        />
      </div>
      
      {/* Bottom row of knobs */}
      <div className="flex justify-between mb-6">
        <VintageKnob 
          value={tremolo} 
          min={0} 
          max={1} 
          onChange={setTremolo} 
          size={70}
          label="TREMOLO"
        />
        
        <VintageKnob 
          value={modulation} 
          min={0} 
          max={1} 
          onChange={setModulation} 
          size={70}
          label="MODULATION"
        />
        
        <VintageKnob 
          value={phase} 
          min={0} 
          max={6.28} 
          onChange={setPhase} 
          size={70}
          label="PHASE"
        />
        
        <VintageKnob 
          value={harmonics} 
          min={0} 
          max={1} 
          onChange={setHarmonics} 
          size={70}
          label="HARMONICS"
        />
      </div>
      
      {/* Waveform indicator */}
      <div className="flex justify-center">
        <div className="px-4 py-1 bg-gray-800 rounded-md text-gray-200 text-sm">
          {getWaveformName()}
        </div>
      </div>
    </div>
  );
};

export default RetroWaveKnobPanel;