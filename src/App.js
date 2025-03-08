import React from 'react';
import RetroRadioWaveSimulator from './components/RetroRadioWaveSimulator';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Simulador de Radio Retro</h1>
      </header>
      <main>
        <RetroRadioWaveSimulator />
      </main>
      <footer>
        <p>Creado con React</p>
      </footer>
    </div>
  );
}

export default App;