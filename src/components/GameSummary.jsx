import React from 'react';
import './GameSummary.css';

function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export default function GameSummary({ winner, onRestart, isDraw, endReason, onClose, time }) {
  let title = '';
  let reasonText = '';
  if (isDraw || winner === null) {
    title = '¡Empate!';
    if (endReason === 'ahogado') reasonText = 'Rey ahogado';
    else if (endReason === 'material') reasonText = 'Tablas por material insuficiente';
    else if (endReason === 'repeticion') reasonText = 'Tablas por repetición de posición';
    else reasonText = 'Empate';
  } else if (endReason === 'rendicion') {
    title = '¡Rendición!';
    reasonText = `El jugador se ha rendido.`;
  } else {
    title = '¡Jaque mate!';
    reasonText = `Ganador: ${winner === 'w' ? 'Blancas' : 'Negras'}`;
  }
  return (
    <div className="game-summary-overlay">
      <div className="game-summary-modal" style={{ position: 'relative' }}>
        <button
          onClick={onClose}
          className="close-btn"
          aria-label="Cerrar resumen"
          style={{ width: 40, height: 40, borderRadius: 8, aspectRatio: '1 / 1', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ×
        </button>
        <h2>{title}</h2>
        <p>{reasonText}</p>
        <p style={{ fontWeight: 600, fontSize: 18, margin: '12px 0 0 0' }}>Tiempo: {formatTime(time)}</p>
        <button onClick={onRestart} style={{ marginTop: 24 }}>Reiniciar partida</button>
      </div>
    </div>
  );
}
