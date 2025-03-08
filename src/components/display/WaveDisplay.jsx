import React from 'react';
import { generateWavePoints } from '../Utils/WaveUtils';

const WaveDisplay = ({ waveParams, getBaseColor, svgRef }) => {
  const { waveCount, powerOn, svgDimensions } = waveParams;
  const padding = 10;
  
  return (
    <div className="wave-display-container">
      <div className={`wave-display ${!powerOn ? 'powered-off' : ''}`}>
        <svg ref={svgRef} width="100%" height={svgDimensions.height}>
          <line 
            x1={padding} 
            y1={svgDimensions.height / 2} 
            x2={svgDimensions.width - padding} 
            y2={svgDimensions.height / 2} 
            stroke="#333" 
            strokeDasharray="4,4" 
          />
          
          {Array.from({ length: waveCount }).map((_, index) => (
            <polyline
              key={index}
              points={generateWavePoints(waveParams, index, padding)}
              fill="none"
              stroke={getBaseColor(index)}
              strokeWidth={3 - index * 0.3}
              strokeLinecap="round"
              strokeOpacity={1 - index * 0.1}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default WaveDisplay;