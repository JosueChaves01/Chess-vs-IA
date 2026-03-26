import { createSlice } from '@reduxjs/toolkit';
import { getInitialBoard, getValidMoves, isValidMove } from '../../utils/chessUtils';
import { END_REASON } from '../../constants/GAME';

const freshState = () => ({
  board: getInitialBoard(),
  turn: 'w',
  kingMoved: { w: false, b: false },
  rookMoved: { w: [false, false], b: [false, false] },
  enPassant: null,
  moveHistory: [],
  winner: null,
  endReason: null,
  pendingPromotion: null,
});

const gameSlice = createSlice({
  name: 'game',
  initialState: freshState(),
  reducers: {
    applyMove(state, action) {
      const { from, to } = action.payload;
      const piece = state.board[from.row][from.col];
      if (!piece) return;
      const { turn, kingMoved, rookMoved, enPassant } = state;
      const board = state.board;

      const validMoves = getValidMoves(board, from, turn, kingMoved, rookMoved, enPassant);
      if (!validMoves.some(m => m.row === to.row && m.col === to.col)) return;

      const moveInfo = { from: { ...from }, to: { ...to }, piece, capture: board[to.row][to.col], promotion: null };

      // CASTLING
      if (piece[1] === 'k' && Math.abs(to.col - from.col) === 2 &&
          isValidMove(board, from, to, turn, kingMoved, rookMoved)) {
        const row = from.row;
        if (to.col === 6) {
          state.board[row][6] = state.board[row][4];
          state.board[row][4] = null;
          state.board[row][5] = state.board[row][7];
          state.board[row][7] = null;
          state.kingMoved[turn] = true;
          state.rookMoved[turn][1] = true;
        } else {
          state.board[row][2] = state.board[row][4];
          state.board[row][4] = null;
          state.board[row][3] = state.board[row][0];
          state.board[row][0] = null;
          state.kingMoved[turn] = true;
          state.rookMoved[turn][0] = true;
        }
        state.enPassant = null;
        state.turn = turn === 'w' ? 'b' : 'w';
        state.moveHistory.push(moveInfo);
        return;
      }

      // EN PASSANT CAPTURE
      if (piece[1] === 'p' && enPassant && to.row === enPassant.row && to.col === enPassant.col) {
        moveInfo.capture = board[from.row][to.col];
        state.board[to.row][to.col] = piece;
        state.board[from.row][from.col] = null;
        state.board[from.row][to.col] = null;
        state.enPassant = null;
        state.turn = turn === 'w' ? 'b' : 'w';
        state.moveHistory.push(moveInfo);
        return;
      }

      // PAWN PROMOTION
      if (piece[1] === 'p' && ((turn === 'w' && to.row === 0) || (turn === 'b' && to.row === 7))) {
        state.board[to.row][to.col] = piece;
        state.board[from.row][from.col] = null;
        state.enPassant = null;
        state.pendingPromotion = { row: to.row, col: to.col, color: turn, from: { ...from } };
        state.moveHistory.push({ ...moveInfo, promotion: null });
        return;
      }

      // NORMAL MOVE
      state.board[to.row][to.col] = piece;
      state.board[from.row][from.col] = null;
      if (piece[1] === 'k') state.kingMoved[turn] = true;
      if (piece[1] === 'r') {
        const homeRow = turn === 'w' ? 7 : 0;
        if (from.row === homeRow && from.col === 0) state.rookMoved[turn][0] = true;
        if (from.row === homeRow && from.col === 7) state.rookMoved[turn][1] = true;
      }
      if (piece[1] === 'p' && Math.abs(to.row - from.row) === 2) {
        state.enPassant = { row: (to.row + from.row) / 2, col: to.col };
      } else {
        state.enPassant = null;
      }
      state.turn = turn === 'w' ? 'b' : 'w';
      state.moveHistory.push(moveInfo);
    },

    completePromotion(state, action) {
      const { pieceType } = action.payload;
      if (!state.pendingPromotion) return;
      const { row, col, color } = state.pendingPromotion;
      state.board[row][col] = color + pieceType;
      if (state.moveHistory.length > 0) {
        state.moveHistory[state.moveHistory.length - 1].promotion = pieceType;
      }
      state.pendingPromotion = null;
      state.turn = color === 'w' ? 'b' : 'w';
    },

    applyAiMove(state, action) {
      const { from, to, uciPromotion } = action.payload;
      const piece = state.board[from.row][from.col];
      if (!piece) return;
      const { kingMoved, rookMoved, enPassant } = state;

      const validMoves = getValidMoves(state.board, from, 'b', kingMoved, rookMoved, enPassant);
      if (!validMoves.some(m => m.row === to.row && m.col === to.col)) return;

      const moveInfo = { from: { ...from }, to: { ...to }, piece, capture: state.board[to.row][to.col], promotion: null };

      if (piece[1] === 'p' && enPassant && to.row === enPassant.row && to.col === enPassant.col) {
        moveInfo.capture = state.board[from.row][to.col];
        state.board[to.row][to.col] = piece;
        state.board[from.row][from.col] = null;
        state.board[from.row][to.col] = null;
        state.enPassant = null;
        state.turn = 'w';
        state.moveHistory.push(moveInfo);
        return;
      }

      if (piece[1] === 'p' && to.row === 7) {
        state.board[to.row][to.col] = 'b' + (uciPromotion || 'q');
        state.board[from.row][from.col] = null;
        state.enPassant = null;
        state.turn = 'w';
        state.moveHistory.push({ ...moveInfo, promotion: uciPromotion || 'q' });
        return;
      }

      state.board[to.row][to.col] = piece;
      state.board[from.row][from.col] = null;
      if (piece[1] === 'k') state.kingMoved.b = true;
      if (piece[1] === 'r') {
        if (from.row === 0 && from.col === 0) state.rookMoved.b[0] = true;
        if (from.row === 0 && from.col === 7) state.rookMoved.b[1] = true;
      }
      if (piece[1] === 'p' && Math.abs(to.row - from.row) === 2) {
        state.enPassant = { row: (from.row + to.row) / 2, col: to.col };
      } else {
        state.enPassant = null;
      }
      state.turn = 'w';
      state.moveHistory.push(moveInfo);
    },

    setSurrender(state) {
      state.endReason = END_REASON.SURRENDER;
      state.winner = state.turn === 'w' ? 'b' : 'w';
    },

    setCheckmate(state) {
      state.winner = state.turn === 'w' ? 'b' : 'w';
      state.endReason = END_REASON.CHECKMATE;
    },

    setStalemate(state) {
      state.winner = 'draw';
      state.endReason = END_REASON.STALEMATE;
    },

    setInsufficientMaterial(state) {
      state.winner = 'draw';
      state.endReason = END_REASON.MATERIAL;
    },

    resetGame() {
      return freshState();
    },
  },
});

export const {
  applyMove, completePromotion, applyAiMove,
  setSurrender, setCheckmate, setStalemate, setInsufficientMaterial, resetGame,
} = gameSlice.actions;
export default gameSlice.reducer;
