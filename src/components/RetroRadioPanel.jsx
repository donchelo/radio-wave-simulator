import React, { useState, useEffect } from 'react';
import DraggableKnob from './DraggableKnob';

const RetroRadioPanel = () => {
  // States for controlling wave parameters
  const [amplitude, setAmplitude] = useState(50);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const [waveCount, setWaveCount] = useState(3);
  const [baseColor, setBaseColor] = useState("#e8e3d5");
  const [time, setTime] = useState(0);
  const [distortion, setDistortion] = useState(0);
  const [harmonics, setHarmonics] = useState(0);
  const [modulation, setModulation] = useState(0);
  const [tremolo, setTremolo] = useState(0);
  const [waveform, setWaveform] = useState(0); // 0: sine, 1: square, 2: triangle, 3: sawtooth
  
  // Animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => (prevTime + 0.1) % 100);
    }, 50);
    
    return () => clearInterval(timer);
  }, []);

  // Get waveform name
  const getWaveformName = () => {
    switch(Math.floor(waveform * 4)) {
      case 1: return "SQUARE WAVE";
      case 2: return "TRIANGLE WAVE";
      case 3: return "SAWTOOTH WAVE";
      default: return "SINE WAVE";
    }
  };
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.4)',
      backgroundColor: '#8B4513',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'linear-gradient(30deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
      margin: '0 auto'
    }}>
      <div style={{
        backgroundColor: '#222',
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        padding: '16px',
        position: 'relative'
      }}>
        {/* Radio name */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <span style={{
            color: '#e8e3d5',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
          }}>WAVE SIMULATOR</span>
        </div>

        {/* Wave display placeholder */}
        <div style={{
          backgroundColor: '#111',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '24px',
          boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.5)',
          height: '140px'
        }}>
          {/* Visualization would go here */}
        </div>
        
        {/* Top row of controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end',
          marginBottom: '24px'
        }}>
          <DraggableKnob 
            value={amplitude} 
            min={10} 
            max={150} 
            onChange={setAmplitude} 
            size={70}
            label="VOLUME"
          />
          
          <DraggableKnob 
            value={waveform} 
            min={0} 
            max={0.99} 
            onChange={setWaveform} 
            size={70}
            label="WAVEFORM"
          />
          
          <DraggableKnob 
            value={distortion} 
            min={0} 
            max={1} 
            onChange={setDistortion} 
            size={70}
            label="DISTORTION"
          />
          
          <DraggableKnob 
            value={waveCount} 
            min={1} 
            max={5} 
            onChange={(val) => setWaveCount(Math.floor(val))} 
            size={70}
            label="LAYERS"
          />
        </div>
        
        {/* Bottom row of controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end',
          marginBottom: '8px'
        }}>
          <DraggableKnob 
            value={tremolo} 
            min={0} 
            max={1} 
            onChange={setTremolo} 
            size={70}
            label="TREMOLO"
          />
          
          <DraggableKnob 
            value={modulation} 
            min={0} 
            max={1} 
            onChange={setModulation} 
            size={70}
            label="MODULATION"
          />
          
          <DraggableKnob 
            value={phase} 
            min={0} 
            max={6.28} 
            onChange={setPhase} 
            size={70}
            label="PHASE"
          />
          
          <DraggableKnob 
            value={harmonics} 
            min={0} 
            max={1} 
            onChange={setHarmonics} 
            size={70}
            label="HARMONICS"
          />
        </div>
        
        {/* Waveform indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: '6px',
            backgroundColor: '#333',
            color: '#e8e3d5',
            fontSize: '0.75rem'
          }}>
            {getWaveformName()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroRadioPanel;