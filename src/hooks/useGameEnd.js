import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCheckmate, setStalemate, setInsufficientMaterial } from '../store/slices/gameSlice';
import { setShowSummary } from '../store/slices/uiSlice';
import {
  selectBoard, selectTurn, selectKingMoved, selectRookMoved,
  selectEnPassant, selectWinner,
} from '../store/selectors/gameSelectors';
import { selectShowStartPanel } from '../store/selectors/uiSelectors';
import { isCheckmate, isStalemate, isInsufficientMaterial } from '../utils/chessUtils';

export function useGameEnd() {
  const dispatch = useDispatch();
  const board = useSelector(selectBoard);
  const turn = useSelector(selectTurn);
  const kingMoved = useSelector(selectKingMoved);
  const rookMoved = useSelector(selectRookMoved);
  const enPassant = useSelector(selectEnPassant);
  const winner = useSelector(selectWinner);
  const showStartPanel = useSelector(selectShowStartPanel);

  useEffect(() => {
    if (winner || showStartPanel) return;
    if (isCheckmate(board, turn, kingMoved, rookMoved)) {
      dispatch(setCheckmate());
      dispatch(setShowSummary(true));
      return;
    }
    if (isStalemate(board, turn, kingMoved, rookMoved, enPassant)) {
      dispatch(setStalemate());
      dispatch(setShowSummary(true));
      return;
    }
    if (isInsufficientMaterial(board)) {
      dispatch(setInsufficientMaterial());
      dispatch(setShowSummary(true));
    }
  }, [board, turn, kingMoved, rookMoved, enPassant, winner, showStartPanel, dispatch]);
}
