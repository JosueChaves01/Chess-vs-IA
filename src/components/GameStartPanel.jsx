import React from 'react';
import './GameSummary.css';

export default function GameStartPanel({ onStart, vsAI, setVsAI }) {
  return (
    <div className="game-summary-overlay">
      <div className="game-summary-modal" style={{ position: 'relative', minWidth: 300 }}>
        <h2>Iniciar partida</h2>
        <div style={{ margin: '18px 0 12px 0' }}>
          <label style={{ fontWeight: 500, marginRight: 12 }}>Modo de juego:</label>
          <label style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="gameMode"
              value="vsAI"
              checked={vsAI}
              onChange={() => setVsAI(true)}
            />
            vs IA
          </label>
          <label>
            <input
              type="radio"
              name="gameMode"
              value="2players"
              checked={!vsAI}
              onChange={() => setVsAI(false)}
            />
            2 jugadores
          </label>
        </div>
        <button onClick={onStart} style={{ marginTop: 18, fontSize: 18, padding: '10px 32px' }}>Comenzar</button>
      </div>
    </div>
  );
}
