import React from 'react';
import VintageKnob from './controls/VintageKnob';
import ToggleKnob from './controls/ToggleKnob';
import ColorKnob from './controls/ColorKnob';
import ColorThemeSelector from './controls/ColorThemeSelector';

// Componente para una fila de controles
const KnobRow = ({ children }) => (
 <div className="knobs-row">
   {children}
 </div>
);

// Componente para un control individual
const KnobUnit = ({ label, value, children }) => (
 <div className="knob-unit">
   {children}
   <div className="knob-value">{value}</div>
 </div>
);

const ControlPanel = ({ waveParams, updateParam, handlePowerToggle }) => {
 const { 
   amplitude, frequency, phase, waveCount, hue, saturation, 
   waveform, distortion, harmonics, modulation, tremolo, 
   powerOn,
   // Nuevos parámetros
   brightness, noise, glitch, speed, echo,
   colorSpread, glow, background, afterglow, colorMode
 } = waveParams;

 // Obtener el nombre del tipo de onda
 const getWaveformName = () => {
   const waveformIndex = Math.floor(waveform * 4);
   switch(waveformIndex) {
     case 1: return "SQUARE";
     case 2: return "TRIANGLE";
     case 3: return "SAWTOOTH";
     default: return "SINE";
   }
 };

 return (
   <div className="knobs-section">
     {/* Primera fila: Parámetros principales de la onda */}
     <KnobRow>
       <KnobUnit label="AMPLITUDE" value={amplitude.toFixed(0)}>
         <VintageKnob 
           value={amplitude} 
           min={10} 
           max={150} 
           onChange={(val) => updateParam('amplitude', val)} 
           size={70}
           label="AMPLITUDE"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="FREQUENCY" value={frequency.toFixed(2)}>
         <VintageKnob 
           value={frequency} 
           min={0.5} 
           max={5} 
           onChange={(val) => updateParam('frequency', val)} 
           size={70}
           label="FREQUENCY"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="WAVEFORM" value={getWaveformName()}>
         <ToggleKnob 
           value={Math.floor(waveform * 4)} 
           options={['SINE', 'SQUARE', 'TRIANGLE', 'SAW']}
           onChange={(val) => updateParam('waveform', val / 3)} 
           size={70}
           label="WAVEFORM"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="LAYERS" value={waveCount}>
         <VintageKnob 
           value={waveCount} 
           min={1} 
           max={8} 
           onChange={(val) => updateParam('waveCount', Math.floor(val))} 
           size={70}
           label="LAYERS"
           disabled={!powerOn}
         />
       </KnobUnit>
     </KnobRow>
     
     {/* Segunda fila: Efectos de onda */}
     <KnobRow>
       <KnobUnit label="DISTORTION" value={distortion.toFixed(2)}>
         <VintageKnob 
           value={distortion} 
           min={0} 
           max={1} 
           onChange={(val) => updateParam('distortion', val)} 
           size={70}
           label="DISTORTION"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="HARMONICS" value={harmonics.toFixed(2)}>
         <VintageKnob 
           value={harmonics} 
           min={0} 
           max={1} 
           onChange={(val) => updateParam('harmonics', val)} 
           size={70}
           label="HARMONICS"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="TREMOLO" value={tremolo.toFixed(2)}>
         <VintageKnob 
           value={tremolo} 
           min={0} 
           max={1} 
           onChange={(val) => updateParam('tremolo', val)} 
           size={70}
           label="TREMOLO"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="MODULATION" value={modulation.toFixed(2)}>
         <VintageKnob 
           value={modulation} 
           min={0} 
           max={1} 
           onChange={(val) => updateParam('modulation', val)} 
           size={70}
           label="MODULATION"
           disabled={!powerOn}
         />
       </KnobUnit>
     </KnobRow>
     
     {/* Controles de Color */}
     <KnobRow>
       <KnobUnit label="COLOR SPREAD" value={`${colorSpread?.toFixed(0) || "10"}`}>
         <ColorKnob 
           value={colorSpread || 10} 
           min={0} 
           max={30} 
           onChange={(val) => updateParam('colorSpread', val)} 
           size={70}
           label="COLOR SPREAD"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="GLOW" value={`${glow?.toFixed(0) || "0"}%`}>
         <VintageKnob 
           value={glow || 0} 
           min={0} 
           max={100} 
           onChange={(val) => updateParam('glow', val)} 
           size={70}
           label="GLOW"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="BACKGROUND" value={`${background?.toFixed(0) || "0"}%`}>
         <VintageKnob 
           value={background || 0} 
           min={0} 
           max={100} 
           onChange={(val) => updateParam('background', val)} 
           size={70}
           label="BACKGROUND"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <div className="knob-unit theme-selector-container">
         <ColorThemeSelector
           currentTheme={waveParams.displayTheme}
           onChange={(theme) => updateParam('displayTheme', theme)}
           disabled={!powerOn}
         />
       </div>
     </KnobRow>
     
     {/* Filas adicionales para los nuevos parámetros, ya distribuidos a lo ancho */}
     <KnobRow>
       <KnobUnit label="BRIGHTNESS" value={`${brightness?.toFixed(0) || "100"}%`}>
         <VintageKnob 
           value={brightness || 100} 
           min={10} 
           max={200} 
           onChange={(val) => updateParam('brightness', val)} 
           size={70}
           label="BRIGHTNESS"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="NOISE" value={`${noise?.toFixed(0) || "0"}%`}>
         <VintageKnob 
           value={noise || 0} 
           min={0} 
           max={100} 
           onChange={(val) => updateParam('noise', val)} 
           size={70}
           label="NOISE"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="GLITCH" value={`${glitch?.toFixed(0) || "0"}%`}>
         <VintageKnob 
           value={glitch || 0} 
           min={0} 
           max={100} 
           onChange={(val) => updateParam('glitch', val)} 
           size={70}
           label="GLITCH"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="ECHO" value={`${echo?.toFixed(0) || "0"}%`}>
         <VintageKnob 
           value={echo || 0} 
           min={0} 
           max={100} 
           onChange={(val) => updateParam('echo', val)} 
           size={70}
           label="ECHO"
           disabled={!powerOn}
         />
       </KnobUnit>
     </KnobRow>
     
     <KnobRow>
       <KnobUnit label="SPEED" value={`${speed?.toFixed(1) || "1.0"}x`}>
         <VintageKnob 
           value={speed || 1.0} 
           min={0.1} 
           max={5} 
           onChange={(val) => updateParam('speed', val)} 
           size={70}
           label="SPEED"
           disabled={!powerOn}
         />
       </KnobUnit>

       <KnobUnit label="AFTERGLOW" value={`${afterglow?.toFixed(0) || "0"}%`}>
         <VintageKnob 
           value={afterglow || 0} 
           min={0} 
           max={100} 
           onChange={(val) => updateParam('afterglow', val)} 
           size={70}
           label="AFTERGLOW"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="PHASE" value={phase.toFixed(2)}>
         <VintageKnob 
           value={phase} 
           min={0} 
           max={6.28} 
           onChange={(val) => updateParam('phase', val)} 
           size={70}
           label="PHASE"
           disabled={!powerOn}
         />
       </KnobUnit>
       
       <KnobUnit label="HUE" value={hue.toFixed(0)}>
         <ColorKnob 
           value={hue} 
           min={0} 
           max={359} 
           onChange={(val) => updateParam('hue', val)} 
           size={70}
           label="HUE"
           disabled={!powerOn}
         />
       </KnobUnit>
     </KnobRow>

     <KnobRow>
       <KnobUnit label="SATURATION" value={saturation.toFixed(0)}>
         <VintageKnob 
           value={saturation} 
           min={0} 
           max={100} 
           onChange={(val) => updateParam('saturation', val)} 
           size={70}
           label="SATURATION"
           disabled={!powerOn}
         />
       </KnobUnit>

       <KnobUnit label="COLOR MODE" value={colorMode || "theme"}>
         <ToggleKnob 
           value={colorMode === "rainbow" ? 1 : 0} 
           options={['THEME', 'RAINBOW']}
           onChange={(val) => updateParam('colorMode', val === 0 ? 'theme' : 'rainbow')} 
           size={70}
           label="COLOR MODE"
           disabled={!powerOn}
         />
       </KnobUnit>
     </KnobRow>
   </div>
 );
};

export default ControlPanel;