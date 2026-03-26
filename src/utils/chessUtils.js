export const PIECE_SYMBOLS = {
  'wp': 'o', 'wr': 't', 'wn': 'm', 'wb': 'v', 'wq': 'w', 'wk': 'l',
  'bp': 'o', 'br': 't', 'bn': 'm', 'bb': 'v', 'bq': 'w', 'bk': 'l',
};

export function getCapturedPieces(board, color) {
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
  const captured = [...initial];
  current.forEach(p => {
    const idx = captured.indexOf(p);
    if (idx !== -1) captured.splice(idx, 1);
  });
  return captured;
}

export function getInitialBoard() {
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

export function isValidMove(board, from, to, turn, kingMoved, rookMoved, enPassant, ignoreKingCaptureCheck = false) {
  const piece = board[from.row][from.col];
  if (!piece) return false;
  if (!ignoreKingCaptureCheck && board[to.row][to.col] && board[to.row][to.col][1] === 'k') return false;
  const type = piece[1];
  const dir = turn === 'w' ? -1 : 1;
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  // Peón
  if (type === 'p') {
    if (dc === 0 && board[to.row][to.col] === null) {
      if ((dr === dir) || (turn === 'w' && from.row === 6 && dr === -2 && board[from.row-1][from.col] === null) || (turn === 'b' && from.row === 1 && dr === 2 && board[from.row+1][from.col] === null)) {
        return true;
      }
    }
    if (Math.abs(dc) === 1 && dr === dir && board[to.row][to.col] && board[to.row][to.col][0] !== turn) {
      return true;
    }
    if (
      enPassant &&
      to.row === enPassant.row &&
      to.col === enPassant.col &&
      Math.abs(dc) === 1 && dr === (turn === 'w' ? -1 : 1)
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
    if (dr === 0 && Math.abs(dc) === 2) {
      const row = from.row;
      // Bug 2: king cannot castle while in check
      if (isKingInCheck(board, turn, kingMoved, rookMoved)) return false;
      if (dc === 2 && !kingMoved[turn] && !rookMoved[turn][1]) {
        if (
          board[row][5] === null &&
          board[row][6] === null &&
          board[row][7] && board[row][7][1] === 'r'
        ) {
          // Bug 1: king cannot pass through attacked squares
          const mid1 = board.map(r => [...r]);
          mid1[row][5] = mid1[row][4]; mid1[row][4] = null;
          if (isKingInCheck(mid1, turn, kingMoved, rookMoved)) return false;
          const mid2 = board.map(r => [...r]);
          mid2[row][6] = mid2[row][4]; mid2[row][4] = null;
          if (isKingInCheck(mid2, turn, kingMoved, rookMoved)) return false;
          return true;
        }
      }
      if (dc === -2 && !kingMoved[turn] && !rookMoved[turn][0]) {
        if (
          board[row][1] === null &&
          board[row][2] === null &&
          board[row][3] === null &&
          board[row][0] && board[row][0][1] === 'r'
        ) {
          // Bug 1: king cannot pass through attacked squares
          const mid1 = board.map(r => [...r]);
          mid1[row][3] = mid1[row][4]; mid1[row][4] = null;
          if (isKingInCheck(mid1, turn, kingMoved, rookMoved)) return false;
          const mid2 = board.map(r => [...r]);
          mid2[row][2] = mid2[row][4]; mid2[row][4] = null;
          if (isKingInCheck(mid2, turn, kingMoved, rookMoved)) return false;
          return true;
        }
      }
      return false;
    }
    if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) {
      for (let r = Math.max(0, to.row - 1); r <= Math.min(7, to.row + 1); r++) {
        for (let c = Math.max(0, to.col - 1); c <= Math.min(7, to.col + 1); c++) {
          if ((r !== from.row || c !== from.col) && board[r][c] === (turn === 'w' ? 'bk' : 'wk')) {
            return false;
          }
        }
      }
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

export function isKingInCheck(board, turn, kingMoved, rookMoved) {
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
  const enemy = turn === 'w' ? 'b' : 'w';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === enemy) {
        if (piece[1] === 'p') {
          const dir = enemy === 'w' ? -1 : 1;
          if (
            kingPos.row === row + dir &&
            (kingPos.col === col + 1 || kingPos.col === col - 1)
          ) {
            return true;
          }
        } else if (isValidMove(board, { row, col }, kingPos, enemy, kingMoved, rookMoved, undefined, true)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isCheckmate(board, turn, kingMoved, rookMoved) {
  if (!isKingInCheck(board, turn, kingMoved, rookMoved)) return false;
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

export function isStalemate(board, turn, kingMoved, rookMoved, enPassant) {
  if (isKingInCheck(board, turn, kingMoved, rookMoved)) return false;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === turn) {
        const moves = getValidMoves(board, { row, col }, turn, kingMoved, rookMoved, enPassant);
        if (moves.length > 0) return false;
      }
    }
  }
  return true;
}

export function isInsufficientMaterial(board) {
  const pieceList = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (p) pieceList.push({ piece: p, row, col });
    }
  }
  const pieces = pieceList.map(x => x.piece);
  // Solo reyes
  if (pieces.every(p => p[1] === 'k')) return true;
  // Rey + alfil/caballo vs rey (3 piezas)
  if (pieces.length === 3 && pieces.filter(p => p[1] !== 'k').every(p => p[1] === 'b' || p[1] === 'n')) return true;
  // Rey + alfil vs rey + alfil, alfiles en el mismo color
  if (pieces.length === 4) {
    const bishops = pieceList.filter(x => x.piece[1] === 'b');
    const kings = pieceList.filter(x => x.piece[1] === 'k');
    if (bishops.length === 2 && kings.length === 2 && bishops[0].piece[0] !== bishops[1].piece[0]) {
      // Mismo color de casilla si (row+col) % 2 coincide
      if ((bishops[0].row + bishops[0].col) % 2 === (bishops[1].row + bishops[1].col) % 2) {
        return true;
      }
    }
  }
  return false;
}

export function getValidMoves(board, from, turn, kingMoved, rookMoved, enPassant) {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(board, from, { row, col }, turn, kingMoved, rookMoved, enPassant)) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = board[from.row][from.col];
        newBoard[from.row][from.col] = null;
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

export function boardToFEN(board, turn = 'w', castling = 'KQkq', enPassant = '-') {
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
