import React from 'react';
import './ColorThemeSelector.css';

const ColorThemeSelector = ({ currentTheme, onChange, disabled = false }) => {
  const themes = [
    { id: 'green', color: '#20ee20', label: 'Green' },
    { id: 'amber', color: '#ff9500', label: 'Amber' },
    { id: 'blue', color: '#209cee', label: 'Blue' },
    { id: 'purple', color: '#b967ff', label: 'Purple' },
    { id: 'red', color: '#ff5252', label: 'Red' }
  ];
  
  const handleThemeClick = (themeId) => {
    if (disabled) return;
    
    if (themeId !== currentTheme) {
      onChange(themeId);
    }
  };
  
  return (
    <div className="color-theme-selector">
      <div className="selector-label">COLOR THEME</div>
      <div className="theme-buttons-container">
        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-button ${currentTheme === theme.id ? 'active' : ''}`}
            style={{ backgroundColor: theme.color }}
            onClick={() => handleThemeClick(theme.id)}
            disabled={disabled}
            aria-label={`${theme.label} theme`}
            title={theme.label}
          />
        ))}
      </div>
      <div className="theme-name">{currentTheme?.toUpperCase()}</div>
    </div>
  );
};

export default ColorThemeSelector;