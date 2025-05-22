import React, { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Board from './components/Board';
import GameSummary from './components/GameSummary';
import MoveHistory from './components/MoveHistory';
import GameStartPanel from './components/GameStartPanel';
import Header from './components/Header';

const pieceSymbols = {
  'wp': 'o', 'wr': 't', 'wn': 'm', 'wb': 'v', 'wq': 'w', 'wk': 'l',
  'bp': 'o', 'br': 't', 'bn': 'm', 'bb': 'v', 'bq': 'w', 'bk': 'l',
};

function getCapturedPieces(board, color) {
  // Cuenta piezas iniciales y actuales
  const initial = color === 'w'
    ? ['wp','wp','wp','wp','wp','wp','wp','wp','wr','wr','wn','wn','wb','wb','wq','wk']
    : ['bp','bp','bp','bp','bp','bp','bp','bp','br','br','bn','bn','bb','bb','bq','bk'];
  const current = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (p && p[0] === color) current.push(p);
    }
  }
  // Devuelve las piezas que faltan
  const captured = [...initial];
  current.forEach(p => {
    const idx = captured.indexOf(p);
    if (idx !== -1) captured.splice(idx, 1);
  });
  return captured;
}

function getInitialBoard() {
  // Tablero inicial de ajedrez
  return [
    ['br','bn','bb','bq','bk','bb','bn','br'],
    ['bp','bp','bp','bp','bp','bp','bp','bp'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['wp','wp','wp','wp','wp','wp','wp','wp'],
    ['wr','wn','wb','wq','wk','wb','wn','wr'],
  ];
}

function isValidMove(board, from, to, turn, kingMoved, rookMoved, enPassant, moveNumber = 1, ignoreKingCaptureCheck = false) {
  const piece = board[from.row][from.col];
  if (!piece) return false;
  // Prohibir capturar cualquier rey, excepto si se está evaluando amenazas (isKingInCheck)
  if (!ignoreKingCaptureCheck && board[to.row][to.col] && board[to.row][to.col][1] === 'k') return false;
  const type = piece[1];
  const dir = turn === 'w' ? -1 : 1;
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  // Peón
  if (type === 'p') {
    // Movimiento simple
    if (dc === 0 && board[to.row][to.col] === null) {
      if ((dr === dir) || (turn === 'w' && from.row === 6 && dr === -2 && board[from.row-1][from.col] === null) || (turn === 'b' && from.row === 1 && dr === 2 && board[from.row+1][from.col] === null)) {
        return true;
      }
    }
    // Captura
    if (Math.abs(dc) === 1 && dr === dir && board[to.row][to.col] && board[to.row][to.col][0] !== turn) {
      return true;
    }
    // Captura al paso
    if (
      enPassant &&
      to.row === enPassant.row &&
      to.col === enPassant.col &&
      Math.abs(dc) === 1 && dr === (turn === 'w' ? -1 : 1) &&
      // Verify it's the immediate next turn after the double pawn move
      enPassant.moveNumber === moveNumber - 1 &&
      // Verify the capturing pawn is on the correct rank (5th for White, 4th for Black)
      ((turn === 'w' && from.row === 3) || (turn === 'b' && from.row === 4))
    ) {
      return true;
    }
    return false;
  }
  // Torre
  if (type === 'r') {
    if (dr !== 0 && dc !== 0) return false;
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    let r = from.row + stepR, c = from.col + stepC;
    while (r !== to.row || c !== to.col) {
      if (board[r][c]) return false;
      r += stepR; c += stepC;
    }
    return !board[to.row][to.col] || board[to.row][to.col][0] !== turn;
  }
  // Alfil
  if (type === 'b') {
    if (Math.abs(dr) !== Math.abs(dc)) return false;
    const stepR = dr / Math.abs(dr);
    const stepC = dc / Math.abs(dc);
    let r = from.row + stepR, c = from.col + stepC;
    while ((r !== to.row || c !== to.col) && r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (board[r][c]) return false;
      r += stepR; c += stepC;
    }
    if (r !== to.row || c !== to.col) return false;
    return !board[to.row][to.col] || board[to.row][to.col][0] !== turn;
  }
  // Dama
  if (type === 'q') {
    // Movimiento como torre
    if (dr === 0 || dc === 0) {
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
      let r = from.row + stepR, c = from.col + stepC;
      while (r !== to.row || c !== to.col) {
        if (r < 0 || r > 7 || c < 0 || c > 7) return false;
        if (board[r][c]) return false;
        r += stepR; c += stepC;
      }
      return !board[to.row][to.col] || board[to.row][to.col][0] !== turn;
    }
    // Movimiento como alfil
    if (Math.abs(dr) === Math.abs(dc)) {
      const stepR = dr / Math.abs(dr);
      const stepC = dc / Math.abs(dc);
      let r = from.row + stepR, c = from.col + stepC;
      while (r !== to.row || c !== to.col) {
        if (r < 0 || r > 7 || c < 0 || c > 7) return false;
        if (board[r][c]) return false;
        r += stepR; c += stepC;
      }
      return !board[to.row][to.col] || board[to.row][to.col][0] !== turn;
    }
    return false;
  }
  // Caballo
  if (type === 'n') {
    if ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) {
      return !board[to.row][to.col] || board[to.row][to.col][0] !== turn;
    }
    return false;
  }
  // Rey
  if (type === 'k') {
    // Enroque
    if (dr === 0 && Math.abs(dc) === 2) {
      const row = from.row;
      // Corto
      if (dc === 2 && !kingMoved[turn] && !rookMoved[turn][1]) {
        // Verifica que el rey y la torre no se hayan movido
        if (
          board[row][5] === null &&
          board[row][6] === null &&
          board[row][7] && board[row][7][1] === 'r' &&
          !kingMoved[turn] &&
          !rookMoved[turn][1]
        ) {
          return true;
        }
      }
      // Largo
      if (dc === -2 && !kingMoved[turn] && !rookMoved[turn][0]) {
        if (
          board[row][1] === null &&
          board[row][2] === null &&
          board[row][3] === null &&
          board[row][0] && board[row][0][1] === 'r' &&
          !kingMoved[turn] &&
          !rookMoved[turn][0]
        ) {
          return true;
        }
      }
      return false;
    }
    if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) {
      // No permitir que los dos reyes queden adyacentes
      for (let r = Math.max(0, to.row - 1); r <= Math.min(7, to.row + 1); r++) {
        for (let c = Math.max(0, to.col - 1); c <= Math.min(7, to.col + 1); c++) {
          if ((r !== from.row || c !== from.col) && board[r][c] === (turn === 'w' ? 'bk' : 'wk')) {
            return false;
          }
        }
      }
      // Verificar que el rey no se mueva a una casilla atacada
      const newBoard = board.map(r => [...r]);
      newBoard[to.row][to.col] = board[from.row][from.col];
      newBoard[from.row][from.col] = null;
      if (isKingInCheck(newBoard, turn, kingMoved, rookMoved)) {
        return false;
      }
      return !board[to.row][to.col] || board[to.row][to.col][0] !== turn;
    }
    return false;
  }
  return false;
}

function isKingInCheck(board, turn, kingMoved, rookMoved) {
  // Encuentra la posición del rey
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
  if (!kingPos) return false;
  
  // ¿Alguna pieza enemiga puede capturar al rey?
  const enemy = turn === 'w' ? 'b' : 'w';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === enemy) {
        const type = piece[1];
        
        // Manejo específico para peones
        if (type === 'p') {
          const dir = enemy === 'w' ? -1 : 1;
          // Un peón ataca en diagonal
          if (
            row + dir === kingPos.row && 
            (col + 1 === kingPos.col || col - 1 === kingPos.col)
          ) {
            return true;
          }
        } 
        // Para todas las demás piezas, utilizar isValidMove con ignoreKingCaptureCheck=true
        else if (isValidMove(
          board, 
          { row, col }, 
          kingPos, 
          enemy, 
          kingMoved, 
          rookMoved, 
          undefined, // enPassant no es relevante para comprobar jaque
          1,         // moveNumber (no relevante para comprobar jaque)
          true       // ignoreKingCaptureCheck - crucial para permitir evaluar ataques al rey
        )) {
          return true;
        }
      }
    }
  }
  return false;
}

function isCheckmate(board, turn, kingMoved, rookMoved) {
  if (!isKingInCheck(board, turn, kingMoved, rookMoved)) return false;
  // Si el rey está en jaque y no hay movimientos válidos, es jaque mate
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === turn) {
        const moves = getValidMoves(board, { row, col }, turn, kingMoved, rookMoved);
        if (moves.length > 0) return false;
      }
    }
  }
  return true;
}

function isStalemate(board, turn, kingMoved, rookMoved, enPassant, moveNumber = 1) {
  // No está en jaque y no tiene movimientos legales
  if (isKingInCheck(board, turn, kingMoved, rookMoved)) return false;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === turn) {
        const moves = getValidMoves(board, { row, col }, turn, kingMoved, rookMoved, enPassant, moveNumber);
        if (moves.length > 0) return false;
      }
    }
  }
  return true;
}

function isInsufficientMaterial(board) {
  const pieces = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (p) pieces.push(p);
    }
  }
  // Solo reyes
  if (pieces.every(p => p[1] === 'k')) return true;
  // Rey y alfil/caballo vs rey
  if (pieces.length === 3 && pieces.filter(p => p[1] !== 'k').every(p => p[1] === 'b' || p[1] === 'n')) return true;
  // Rey y alfil vs rey y alfil (ambos alfiles en el mismo color) - simplificado
  return false;
}

function getValidMoves(board, from, turn, kingMoved, rookMoved, enPassant, currentMoveNumber = 1) {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(board, from, { row, col }, turn, kingMoved, rookMoved, enPassant, currentMoveNumber)) {
        // Simula el movimiento y verifica que el rey no quede en jaque
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = board[from.row][from.col];
        newBoard[from.row][from.col] = null;
        // Si es captura al paso, elimina el peón capturado
        const piece = board[from.row][from.col];
        if (piece && piece[1] === 'p' && enPassant && row === enPassant.row && col === enPassant.col) {
          newBoard[from.row][col] = null;
        }
        if (!isKingInCheck(newBoard, turn, kingMoved, rookMoved)) {
          moves.push({ row, col });
        }
      }
    }
  }
  return moves;
}

// Convierte el tablero a FEN para Stockfish
function boardToFEN(board, turn = 'w', castling = 'KQkq', enPassant = '-') {
  let fen = '';
  for (let row = 0; row < 8; row++) {
    let empty = 0;
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        const code = p[1];
        const isWhite = p[0] === 'w';
        const letter =
          code === 'p' ? 'p' :
          code === 'r' ? 'r' :
          code === 'n' ? 'n' :
          code === 'b' ? 'b' :
          code === 'q' ? 'q' :
          code === 'k' ? 'k' : '';
        fen += isWhite ? letter.toUpperCase() : letter;
      }
    }
    if (empty > 0) fen += empty;
    if (row < 7) fen += '/';
  }
  fen += ` ${turn} ${castling} ${enPassant} 0 1`;
  return fen;
}

function App() {
  const [board, setBoard] = useState(getInitialBoard());
  const [selected, setSelected] = useState(null); // {row, col} o null
  const [turn, setTurn] = useState('w'); // 'w' o 'b'
  const [kingMoved, setKingMoved] = useState({ w: false, b: false });
  const [rookMoved, setRookMoved] = useState({ w: [false, false], b: [false, false] });
  const [promotion, setPromotion] = useState(null); // {row, col, color}
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState(null);
  const [enPassant, setEnPassant] = useState(null); // {row, col, moveNumber} o null
  const [moveNumber, setMoveNumber] = useState(1); // Track move number for en passant validation
  const [moveHistory, setMoveHistory] = useState([]); // [{from, to, piece, capture, promotion}]
  const [showStartPanel, setShowStartPanel] = useState(true);
  const [selectedColor, setSelectedColor] = useState('w');
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [surrendered, setSurrendered] = useState(false);
  const [endReason, setEndReason] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [vsAI, setVsAI] = useState(false); // Nuevo: modo IA
  const [stockfish, setStockfish] = useState(null);

  // Cronómetro
  React.useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (!timerActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Detener cronómetro cuando termina la partida
  React.useEffect(() => {
    if (winner) {
      setTimerActive(false);
    }
  }, [winner]);

  // Detectar fin de partida después de cada movimiento, incluyendo movimientos de la IA
  useEffect(() => {
    if (winner || showStartPanel) return;
    // Jaque mate
    if (isCheckmate(board, turn, kingMoved, rookMoved)) {
      setWinner(turn === 'w' ? 'b' : 'w');
      setEndReason('jaque mate');
      return;
    }
    // Ahogado
    if (isStalemate(board, turn, kingMoved, rookMoved, enPassant)) {
      setWinner('draw');
      setEndReason('ahogado');
      return;
    }
    // Material insuficiente
    if (isInsufficientMaterial(board)) {
      setWinner('draw');
      setEndReason('material');
      return;
    }
  }, [board, turn, kingMoved, rookMoved, enPassant, winner, showStartPanel]);

  // Asegura que la IA no mueva después de que la partida terminó
  useEffect(() => {
    if (winner && stockfish) {
      stockfish.terminate();
      setStockfish(null);
    }
  }, [winner]);

  // Mueve una pieza directamente (usado por la IA)
  function movePieceDirectly(from, to) {
    const piece = board[from.row][from.col];
    if (!piece) return;
    const validMoves = getValidMoves(board, from, 'b', kingMoved, rookMoved, enPassant);
    const isMoveAllowed = validMoves.some(m => m.row === to.row && m.col === to.col);
    if (!isMoveAllowed) return;
    const newBoard = board.map(r => [...r]);
    let moveInfo = { from: { ...from }, to: { ...to }, piece, capture: board[to.row][to.col], promotion: null };
    // PROMOCIÓN DE PEÓN
    if (piece[1] === 'p' && to.row === 7) {
      newBoard[to.row][to.col] = 'bq';
      newBoard[from.row][from.col] = null;
      setBoard(newBoard);
      setPromotion(null);
      setSelected(null);
      setTurn('w');
      setMoveHistory(prev => [...prev, { ...moveInfo, promotion: true }]);
      return;
    }
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
    setBoard(newBoard);
    setSelected(null);
    setTurn('w');
    setMoveHistory(prev => [...prev, moveInfo]);
  }

  // Lógica para que la IA juegue automáticamente
  useEffect(() => {
    if (!vsAI || turn !== 'b' || winner || !stockfish || showStartPanel) return;
    const fen = boardToFEN(board, 'b');
    stockfish.postMessage('ucinewgame');
    stockfish.postMessage('position fen ' + fen);
    stockfish.postMessage('go depth 12');
    stockfish.onmessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : '';
      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        if (!move || move.length < 4) return;
        const from = { row: 8 - parseInt(move[1]), col: move.charCodeAt(0) - 97 };
        const to = { row: 8 - parseInt(move[3]), col: move.charCodeAt(2) - 97 };
        setTimeout(() => movePieceDirectly(from, to), 200);
      }
    };
    // eslint-disable-next-line
  }, [board, turn, vsAI, stockfish, winner, showStartPanel]);

  function handleStartGame() {
    setShowStartPanel(false);
    setTimer(0);
    setTimerActive(false);
    setTurn('w'); // Siempre comienza el jugador con blancas
    setBoard(getInitialBoard());
    setSelected(null);
    setKingMoved({ w: false, b: false });
    setRookMoved({ w: [false, false], b: [false, false] });
    setPromotion(null);
    setEnPassant(null);
    setWinner(null);
    setMoveHistory([]);
    setMoveNumber(1);
    // Reiniciar Stockfish si vsAI está activo
    if (vsAI) {
      if (stockfish) {
        stockfish.terminate();
      }
      const worker = new window.Worker('/stockfish.js');
      setStockfish(worker);
    } else {
      if (stockfish) {
        stockfish.terminate();
        setStockfish(null);
      }
    }
  }

  function handleRestart() {
    setWinner(null);
    setEndReason(null);
    setBoard(getInitialBoard());
    setSelected(null);
    setTurn('w');
    setKingMoved({ w: false, b: false });
    setRookMoved({ w: [false, false], b: [false, false] });
    setPromotion(null);
    setEnPassant(null); // Corregido: siempre reiniciar enPassant
    setMoveNumber(1); // Reset move number when restarting
    setMoveHistory([]); // Corregido: reiniciar historial
    setTimer(0); // Reiniciar cronómetro
    setTimerActive(false);
    setSurrendered(false);
    setShowStartPanel(true); // Mostrar panel de inicio tras reinicio
    // Reiniciar Stockfish si vsAI está activo
    if (vsAI) {
      if (stockfish) {
        stockfish.terminate();
      }
      const worker = new window.Worker('/stockfish.js');
      setStockfish(worker);
    } else {
      if (stockfish) {
        stockfish.terminate();
        setStockfish(null);
      }
    }
  }

  function handleSurrender() {
    setSurrendered(true);
    setEndReason('rendicion');
    setWinner(turn === 'w' ? 'b' : 'w'); // Marca como ganador al oponente
    setShowSummary(true); // Muestra el resumen de partida inmediatamente
    setTimerActive(false);
  }

  function isOwnPiece(piece) {
    return piece && piece[0] === turn;
  }

  function handleSquareClick(row, col) {
    if (promotion || winner) return;
    const piece = board[selected?.row]?.[selected?.col];
    if (selected) {
      if (selected.row === row && selected.col === col) {
        setSelected(null);
        return;
      }
      if (isOwnPiece(board[row][col])) {
        setSelected({ row, col });
        return;
      }
      const validMoves = getValidMoves(board, selected, turn, kingMoved, rookMoved, enPassant, moveNumber);
      const isMoveAllowed = validMoves.some(m => m.row === row && m.col === col);
      if (!isMoveAllowed) return;
      if (!timerActive && moveHistory.length === 0) {
        setTimerActive(true);
      }
      if (Board.animateMove) {
        Board.animateMove(selected, { row, col }, board[selected.row][selected.col]);
      }
      const newBoard = board.map(r => [...r]);
      let moveInfo = { from: { ...selected }, to: { row, col }, piece: board[selected.row][selected.col], capture: board[row][col], promotion: null };
      // ENROQUE
      if (piece && piece[1] === 'k' && Math.abs(col - selected.col) === 2 && isValidMove(board, selected, { row, col }, turn, kingMoved, rookMoved)) {
        // Corto
        if (col === 6) {
          newBoard[row][6] = newBoard[row][4]; // Rey
          newBoard[row][4] = null;
          newBoard[row][5] = newBoard[row][7]; // Torre
          newBoard[row][7] = null;
          setKingMoved(prev => ({ ...prev, [turn]: true }));
          setRookMoved(prev => ({ ...prev, [turn]: [prev[turn][0], true] }));
        }
        // Largo
        if (col === 2) {
          newBoard[row][2] = newBoard[row][4]; // Rey
          newBoard[row][4] = null;
          newBoard[row][3] = newBoard[row][0]; // Torre
          newBoard[row][0] = null;
          setKingMoved(prev => ({ ...prev, [turn]: true }));
          setRookMoved(prev => ({ ...prev, [turn]: [true, prev[turn][1]] }));
        }
        setBoard(newBoard);
        setSelected(null);
        setTurn(turn === 'w' ? 'b' : 'w');
        setMoveHistory(prev => [...prev, moveInfo]);
        // Comprobar ahogado tras enroque
        setTimeout(() => {
          const nextTurn = turn === 'w' ? 'b' : 'w';
          if (isStalemate(newBoard, nextTurn, kingMoved, rookMoved, enPassant, moveNumber)) {
            setWinner('draw');
            setEndReason('ahogado');
          } else if (isInsufficientMaterial(newBoard)) {
            setWinner('draw');
            setEndReason('material');
          }
        }, 100);
        return;
      }
      // CAPTURA AL PASO
      if (piece && piece[1] === 'p' && enPassant && row === enPassant.row && col === enPassant.col) {
        moveInfo.capture = board[selected.row][col];
        newBoard[row][col] = board[selected.row][selected.col];
        newBoard[selected.row][selected.col] = null;
        // Elimina el peón capturado
        newBoard[selected.row][col] = null;
        setBoard(newBoard);
        setEnPassant(null);
        setSelected(null);
        setTurn(prevTurn => {
          const nextTurn = prevTurn === 'w' ? 'b' : 'w';
          setTimeout(() => {
            if (isCheckmate(newBoard, nextTurn, kingMoved, rookMoved)) {
              setWinner(nextTurn === 'w' ? 'b' : 'w');
            }
          }, 100);
          return nextTurn;
        });
        setMoveHistory(prev => [...prev, moveInfo]);
        // Comprobar ahogado tras captura al paso
        setTimeout(() => {
          const nextTurn = turn === 'w' ? 'b' : 'w';
          if (isStalemate(newBoard, nextTurn, kingMoved, rookMoved, enPassant, moveNumber) || isInsufficientMaterial(newBoard)) {
            setWinner('draw');
            setEndReason('ahogado');
          } else if (isInsufficientMaterial(newBoard)) {
            setWinner('draw');
            setEndReason('material');
          }
        }, 100);
        return;
      }
      // PROMOCIÓN DE PEÓN
      if (piece && piece[1] === 'p' && ((turn === 'w' && row === 0) || (turn === 'b' && row === 7))) {
        setPromotion({ row, col, color: turn, board: newBoard, from: { ...selected } });
        setEnPassant(null);
        setSelected(null);
        setMoveHistory(prev => [...prev, { ...moveInfo, promotion: true }]);
        // Comprobar ahogado tras promoción
        setTimeout(() => {
          const nextTurn = turn === 'w' ? 'b' : 'w';
          if (isStalemate(newBoard, nextTurn, kingMoved, rookMoved, enPassant, moveNumber) || isInsufficientMaterial(newBoard)) {
            setWinner('draw');
            setEndReason('ahogado');
          } else if (isInsufficientMaterial(newBoard)) {
            setWinner('draw');
            setEndReason('material');
          }
        }, 100);
        return;
      }
      // Movimiento normal
      newBoard[row][col] = board[selected.row][selected.col];
      newBoard[selected.row][selected.col] = null;
      // Si el rey se mueve, actualizar kingMoved
      if (piece && piece[1] === 'k') {
        setKingMoved(prev => ({ ...prev, [turn]: true }));
      }
      // Si una torre se mueve, actualizar rookMoved
      if (piece && piece[1] === 'r') {
        if (selected.row === (turn === 'w' ? 7 : 0) && selected.col === 0) {
          setRookMoved(prev => ({ ...prev, [turn]: [true, prev[turn][1]] }));
        }
        if (selected.row === (turn === 'w' ? 7 : 0) && selected.col === 7) {
          setRookMoved(prev => ({ ...prev, [turn]: [prev[turn][0], true] }));
        }
      }
      // Si peón avanza dos, habilita en passant
      if (piece && piece[1] === 'p' && Math.abs(row - selected.row) === 2) {
        setEnPassant({ 
          row: (row + selected.row) / 2, 
          col,
          moveNumber // Store the current move number when setting en passant
        });
      } else {
        setEnPassant(null);
      }
      
      // Increment move number after a move is made
      setMoveNumber(moveNumber + 1);
      setBoard(newBoard);
      setSelected(null);
      setTurn(prevTurn => {
        const nextTurn = prevTurn === 'w' ? 'b' : 'w';
        setTimeout(() => {
          if (isCheckmate(newBoard, nextTurn, kingMoved, rookMoved)) {
            setWinner(nextTurn === 'w' ? 'b' : 'w');
          }
        }, 100);
        return nextTurn;
      });
      setMoveHistory(prev => [...prev, moveInfo]);
      // Comprobar ahogado tras movimiento normal
      setTimeout(() => {
        const nextTurn = turn === 'w' ? 'b' : 'w';
        if (isStalemate(newBoard, nextTurn, kingMoved, rookMoved, enPassant, moveNumber) || isInsufficientMaterial(newBoard)) {
          setWinner('draw');
          setEndReason('ahogado');
        } else if (isInsufficientMaterial(newBoard)) {
          setWinner('draw');
          setEndReason('material');
        }
      }, 100);
      return;
    }
    if (isOwnPiece(board[row][col])) {
      setSelected({ row, col });
    }
  }

  function handlePromotion(pieceType) {
    if (!promotion) return;
    const { row, col, color, board, from } = promotion;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = color + pieceType;
    newBoard[from.row][from.col] = null;
    setBoard(newBoard);
    setPromotion(null);
    setSelected(null);
    setTurn(color === 'w' ? 'b' : 'w');
  }

  const validMoves = selected ? getValidMoves(board, selected, turn, kingMoved, rookMoved, enPassant) : [];
  const capturedWhite = getCapturedPieces(board, 'b');
  const capturedBlack = getCapturedPieces(board, 'w');

  return (
    <div className="App">
      <Header onSurrender={handleSurrender} timer={timer} />
      <div className="app-content">
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 24, width: '100%', height: '100%' }}>
          {/* Historial de movimientos */}
          <div style={{ marginTop: 32 }}>
            <MoveHistory moveHistory={moveHistory} />
          </div>
          {/* Tablero y capturadas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginTop: 32 }}>
            <div style={{ width: 'min(98vw, 700px)', height: 'min(98vw, 700px)' }}>
              <Board 
                board={board} 
                onSquareClick={handleSquareClick}   
                selected={selected} 
                validMoves={validMoves}
                turn={turn}
                isKingInCheck={(b, t) => isKingInCheck(b, t, kingMoved, rookMoved)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 0 0', minHeight: capturedWhite.length > 8 || capturedBlack.length > 8 ? 84 : 56, width: '87%' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300 }}>
                {capturedWhite.map((p, i) => (
                  <span key={i} style={{ fontSize: 28, fontFamily: 'Merifont', color: '#222', textShadow: '0 0 2px #fff', userSelect: 'none' }}>{pieceSymbols[p]}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300, justifyContent: 'flex-end' }}>
                {capturedBlack.map((p, i) => (
                  <span key={i} style={{ fontSize: 28, fontFamily: 'Merifont', color: '#fff', textShadow: '0 0 2px #000', userSelect: 'none' }}>{pieceSymbols[p]}</span>
                ))}
              </div>
            </div>
            {promotion && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: 8, display: 'flex', gap: 16, fontFamily: 'Merifont', fontSize: 32, fontWeight: 700, color: '#222', textShadow: '0 0 2px #fff', userSelect: 'none' }}>
                  {['q','r','b','n'].map(type => (
                    <button key={type} style={{ fontSize: 32, padding: 12 }} onClick={() => handlePromotion(type)}>
                      {pieceSymbols[promotion.color + type]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* GameSummary y botón para mostrarlo */}
            {winner && !showStartPanel && showSummary && (
              <GameSummary winner={winner} onRestart={handleRestart} endReason={endReason} time={timer} onClose={() => setShowSummary(false)} />
            )}
            {winner && !showStartPanel && !showSummary && (
              <div style={{ position: 'absolute', right: -280, bottom: 0 }}>
                <button onClick={() => setShowSummary(true)} style={{ padding: '10px 32px', fontSize: 18, background: '#444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #0002', letterSpacing: 1 }}>
                  Ver resumen de partida
                </button>
              </div>
            )}
            {showStartPanel && (
              <GameStartPanel
                onStart={handleStartGame}
                vsAI={vsAI}
                setVsAI={setVsAI}
              />
            )}
            {/* Mensaje de empate solo si no está el panel de inicio */}
            {winner === 'draw' && !showStartPanel && showSummary && (
              <GameSummary winner={null} isDraw={true} onRestart={handleRestart} endReason={endReason} time={timer} onClose={() => setShowSummary(false)} />
            )}
            {winner === 'draw' && !showStartPanel && !showSummary && (
              <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <button onClick={() => setShowSummary(true)} style={{ padding: '10px 32px', fontSize: 18, background: '#444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #0002', letterSpacing: 1 }}>
                  Ver resumen de partida
                </button>
              </div>
            )}
          </div>
          {/* Div fantasma para centrar el tablero */}
          <div style={{ width: 220, minWidth: 120, maxWidth: 220, height: '1px', visibility: 'hidden' }} aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
}

export default App

