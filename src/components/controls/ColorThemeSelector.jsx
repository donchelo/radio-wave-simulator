import React from 'react';
import './ColorThemeSelector.css';

const ColorThemeSelector = ({ currentTheme, onChange, disabled }) => {
  const themes = [
    { id: 'green', name: 'Green', color: '#20ee20' },
    { id: 'amber', name: 'Amber', color: '#ff9500' },
    { id: 'blue', name: 'Blue', color: '#209cee' },
    { id: 'purple', name: 'Purple', color: '#9d4edd' },
    { id: 'teal', name: 'Teal', color: '#20eedf' }
  ];

  return (
    <div className="color-theme-selector">
      <div className="selector-label">COLOR THEME</div>
      <div className="theme-buttons">
        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-button ${currentTheme === theme.id ? 'active' : ''}`}
            style={{ backgroundColor: theme.color }}
            onClick={() => onChange(theme.id)}
            disabled={disabled}
            title={theme.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorThemeSelector;