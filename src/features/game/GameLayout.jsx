import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './GameLayout.module.css';
import Header from '../header/Header';
import Board from '../board/Board';
import CapturedPieces from '../board/CapturedPieces';
import MoveHistory from '../history/MoveHistory';
import GameStartPanel from '../start/GameStartPanel';
import GameSummary from '../summary/GameSummary';
import PromotionModal from './PromotionModal';
import { useStockfish } from '../../hooks/useStockfish';
import { applyMove, completePromotion, resetGame, setSurrender } from '../../store/slices/gameSlice';
import {
  setSelected, clearSelected, setShowStartPanel, setShowSummary,
  setTimerActive, resetTimerState, triggerMoveAnimation,
} from '../../store/slices/uiSlice';
import { setVsAI, setAiDifficulty, setStockfishError } from '../../store/slices/aiSlice';
import {
  selectBoard, selectTurn, selectKingMoved, selectRookMoved,
  selectEnPassant, selectMoveHistory, selectWinner, selectPendingPromotion,
  selectSelected,
} from '../../store/selectors/gameSelectors';
import {
  selectShowStartPanel, selectShowSummary, selectVsAI, selectAiDifficulty,
  selectStockfishError, selectTimerActive,
} from '../../store/selectors/uiSelectors';
import { getValidMoves, isKingInCheck } from '../../utils/chessUtils';

export default function GameLayout() {
  const dispatch = useDispatch();

  const board = useSelector(selectBoard);
  const turn = useSelector(selectTurn);
  const kingMoved = useSelector(selectKingMoved);
  const rookMoved = useSelector(selectRookMoved);
  const enPassant = useSelector(selectEnPassant);
  const moveHistory = useSelector(selectMoveHistory);
  const winner = useSelector(selectWinner);
  const pendingPromotion = useSelector(selectPendingPromotion);
  const selected = useSelector(selectSelected);
  const showStartPanel = useSelector(selectShowStartPanel);
  const showSummary = useSelector(selectShowSummary);
  const vsAI = useSelector(selectVsAI);
  const aiDifficulty = useSelector(selectAiDifficulty);
  const stockfishError = useSelector(selectStockfishError);
  const timerActive = useSelector(selectTimerActive);

  const { initWorker, terminateWorker } = useStockfish();

  const handleSquareClick = useCallback((row, col) => {
    if (pendingPromotion || winner) return;
    if (selected) {
      if (selected.row === row && selected.col === col) {
        dispatch(clearSelected());
        return;
      }
      if (board[row][col]?.[0] === turn) {
        dispatch(setSelected({ row, col }));
        return;
      }
      const moves = getValidMoves(board, selected, turn, kingMoved, rookMoved, enPassant);
      if (!moves.some(m => m.row === row && m.col === col)) return;
      if (!timerActive && moveHistory.length === 0) dispatch(setTimerActive(true));
      dispatch(triggerMoveAnimation({ from: selected, to: { row, col }, piece: board[selected.row][selected.col] }));
      dispatch(applyMove({ from: selected, to: { row, col } }));
      dispatch(clearSelected());
      return;
    }
    if (board[row][col]?.[0] === turn) dispatch(setSelected({ row, col }));
  }, [board, selected, turn, kingMoved, rookMoved, enPassant, pendingPromotion, winner, timerActive, moveHistory.length, dispatch]);

  const handlePromotion = useCallback((pieceType) => {
    dispatch(completePromotion({ pieceType }));
  }, [dispatch]);

  const handleStartGame = useCallback(() => {
    dispatch(resetGame());
    dispatch(setShowStartPanel(false));
    dispatch(setShowSummary(false));
    dispatch(clearSelected());
    dispatch(resetTimerState());
    dispatch(setStockfishError(false));
    if (vsAI) initWorker(); else terminateWorker();
  }, [vsAI, initWorker, terminateWorker, dispatch]);

  const handleRestart = useCallback(() => {
    dispatch(resetGame());
    dispatch(setShowStartPanel(true));
    dispatch(setShowSummary(false));
    dispatch(clearSelected());
    dispatch(resetTimerState());
    dispatch(setStockfishError(false));
    terminateWorker();
    if (vsAI) initWorker();
  }, [vsAI, initWorker, terminateWorker, dispatch]);

  const handleSurrender = useCallback(() => {
    dispatch(setSurrender());
    dispatch(setShowSummary(true));
    dispatch(setTimerActive(false));
  }, [dispatch]);

  const checkInCheck = useCallback(
    (b, t) => isKingInCheck(b, t, kingMoved, rookMoved),
    [kingMoved, rookMoved]
  );

  return (
    <>
      <Header onSurrender={handleSurrender} />
      <div className={styles.appContent}>
        <div className={styles.mainRow}>
          <div className={styles.historyCol}>
            <MoveHistory />
          </div>
          <div className={styles.boardCol}>
            <div className={styles.boardWrapper}>
              <Board onSquareClick={handleSquareClick} isKingInCheck={checkInCheck} />
            </div>
            <CapturedPieces />
            {pendingPromotion && (
              <PromotionModal color={pendingPromotion.color} onSelect={handlePromotion} />
            )}
            {winner && !showStartPanel && showSummary && (
              <GameSummary onRestart={handleRestart} onClose={() => dispatch(setShowSummary(false))} />
            )}
            {winner && !showStartPanel && !showSummary && (
              <div className={styles.summaryBtnWrap}>
                <button onClick={() => dispatch(setShowSummary(true))}>
                  Ver resumen de partida
                </button>
              </div>
            )}
            {showStartPanel && (
              <GameStartPanel
                onStart={handleStartGame}
                vsAI={vsAI}
                setVsAI={v => dispatch(setVsAI(v))}
                aiDifficulty={aiDifficulty}
                setAiDifficulty={v => dispatch(setAiDifficulty(v))}
              />
            )}
            {stockfishError && vsAI && !showStartPanel && (
              <div className={styles.stockfishError}>
                <p>Error al cargar el motor de IA.</p>
                <button onClick={() => { dispatch(setStockfishError(false)); initWorker(); }}>
                  Reintentar
                </button>
              </div>
            )}
          </div>
          <div className={styles.ghostCol} aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
