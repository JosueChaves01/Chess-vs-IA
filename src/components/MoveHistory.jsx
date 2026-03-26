import React from 'react';
import './MoveHistory.css';
import { PIECE_SYMBOLS as pieceSymbols } from '../utils/chessUtils';

export default function MoveHistory({ moveHistory }) {
  return (
    <div className="move-history-container">
      <div className="move-history-title">Historial</div>
      <ol className="move-history-list">
        {[...moveHistory].reverse().map((m, i) => (
          <li key={moveHistory.length - 1 - i}>
            <span className="piece-icon">{pieceSymbols[m.piece]}</span>
            {String.fromCharCode(97 + m.from.col)}{8 - m.from.row}
            {' → '}
            {String.fromCharCode(97 + m.to.col)}{8 - m.to.row}
            {m.capture ? ' ×' : ''}
            {m.promotion ? ` =${m.promotion.toUpperCase()}` : ''}
          </li>
        ))}
      </ol>
    </div>
  );
}
