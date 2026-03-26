import { createSelector } from '@reduxjs/toolkit';
import { getValidMoves, getCapturedPieces } from '../../utils/chessUtils';

export const selectBoard = state => state.game.board;
export const selectTurn = state => state.game.turn;
export const selectKingMoved = state => state.game.kingMoved;
export const selectRookMoved = state => state.game.rookMoved;
export const selectEnPassant = state => state.game.enPassant;
export const selectMoveHistory = state => state.game.moveHistory;
export const selectWinner = state => state.game.winner;
export const selectEndReason = state => state.game.endReason;
export const selectPendingPromotion = state => state.game.pendingPromotion;
export const selectSelected = state => state.ui.selected;

export const selectLastMove = state => {
  const h = state.game.moveHistory;
  return h.length > 0 ? h[h.length - 1] : null;
};

export const selectValidMoves = createSelector(
  [selectBoard, selectSelected, selectTurn, selectKingMoved, selectRookMoved, selectEnPassant],
  (board, selected, turn, kingMoved, rookMoved, enPassant) => {
    if (!selected) return [];
    return getValidMoves(board, selected, turn, kingMoved, rookMoved, enPassant);
  }
);

export const selectCapturedWhite = createSelector(
  [selectBoard],
  board => getCapturedPieces(board, 'b')
);

export const selectCapturedBlack = createSelector(
  [selectBoard],
  board => getCapturedPieces(board, 'w')
);
