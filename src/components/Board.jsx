import React, { useRef, useEffect, useState } from 'react';
import './Board.css';

const BOARD_SIZE = 8;

function renderPiece(piece, isMoving, style) {
  if (!piece) return null;
  const pieceSymbols = {
    'wp': 'o', 'wr': 't', 'wn': 'm', 'wb': 'v', 'wq': 'w', 'wk': 'l',
    'bp': 'o', 'br': 't', 'bn': 'm', 'bb': 'v', 'bq': 'w', 'bk': 'l',
  };
  // Si está en animación, combina el transform de desplazamiento con un pequeño escalado
  let finalStyle = style || {};
  if (isMoving && style && style.transform) {
    finalStyle = { ...style, transform: `scale(1.08) ${style.transform}` };
  }
  return <div className={`piece ${piece[0] === 'w' ? 'white' : 'black'}${isMoving ? ' moving' : ''}`} style={finalStyle}>{pieceSymbols[piece]}</div>;
}

export default function Board({ board, onSquareClick, selected, validMoves, turn, isKingInCheck }) {
  const [moveAnim, setMoveAnim] = useState(null);
  const boardRef = useRef();

  // Detectar si el rey del turno actual está en jaque y su posición
  function getKingInCheckSquare() {
    // Usar la función pasada por props para saber si el rey del turno está en jaque
    let kingPos = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === turn + 'k') {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }
    if (!kingPos) return null;
    if (isKingInCheck && isKingInCheck(board, turn)) {
      return kingPos;
    }
    return null;
  }
  const kingInCheck = getKingInCheckSquare();

  // Detecta si se debe animar el movimiento
  useEffect(() => {
    if (moveAnim && moveAnim.progress < 1) {
      const anim = requestAnimationFrame(() => {
        setMoveAnim(animPrev => {
          if (!animPrev) return null;
          const next = Math.min(1, animPrev.progress + 0.13);
          return { ...animPrev, progress: next };
        });
      });
      return () => cancelAnimationFrame(anim);
    }
    if (moveAnim && moveAnim.progress >= 1) {
      setTimeout(() => setMoveAnim(null), 80);
    }
  }, [moveAnim]);

  // Llama a esta función desde App.jsx al mover una pieza
  Board.animateMove = (from, to, piece) => {
    setMoveAnim({ from, to, piece, progress: 0 });
  };

  // Calcula el estilo de la pieza animada
  function getAnimStyle() {
    if (!moveAnim) return undefined;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return undefined;
    const size = rect.width / 8;
    const dx = (moveAnim.to.col - moveAnim.from.col) * size * moveAnim.progress;
    const dy = (moveAnim.to.row - moveAnim.from.row) * size * moveAnim.progress;
    const left = moveAnim.from.col * size;
    const top = moveAnim.from.row * size;
    return {
      position: 'absolute',
      left,
      top,
      width: size,
      height: size,
      pointerEvents: 'none',
      transform: `translate(${dx}px, ${dy}px)`
    };
  }

  return (
    <div className="board" ref={boardRef} style={{ position: 'relative' }}>
      {/* Pieza animada sobre el tablero */}
      {moveAnim && (
        renderPiece(moveAnim.piece, true, getAnimStyle())
      )}
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          const isSelected = selected && selected.row === rowIndex && selected.col === colIndex;
          const isValidMove = validMoves && validMoves.some(m => m.row === rowIndex && m.col === colIndex);
          // Oculta la pieza de origen durante la animación
          const hidePiece = moveAnim && moveAnim.from.row === rowIndex && moveAnim.from.col === colIndex && moveAnim.progress < 1;
          const isKingInCheck = kingInCheck && kingInCheck.row === rowIndex && kingInCheck.col === colIndex;
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'}${isSelected ? ' selected' : ''}${isValidMove ? ' valid-move' : ''}${isKingInCheck ? ' in-check' : ''}`}
              onClick={() => onSquareClick(rowIndex, colIndex)}
              style={{ position: 'relative' }}
            >
              {!hidePiece && renderPiece(square)}
            </div>
          );
        })
      )}
    </div>
  );
}
