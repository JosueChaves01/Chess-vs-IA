import { useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyAiMove } from '../store/slices/gameSlice';
import { setStockfishError, setIsAiThinking } from '../store/slices/aiSlice';
import { selectBoard, selectTurn, selectWinner } from '../store/selectors/gameSelectors';
import { selectVsAI, selectAiDifficulty, selectShowStartPanel } from '../store/selectors/uiSelectors';
import { boardToFEN } from '../utils/chessUtils';
import { AI_DEPTH_MAP, AI_MOVE_DELAY_MS, STOCKFISH_WORKER_PATH } from '../constants/AI';

export function useStockfish() {
  const dispatch = useDispatch();
  const workerRef = useRef(null);

  const board = useSelector(selectBoard);
  const turn = useSelector(selectTurn);
  const winner = useSelector(selectWinner);
  const vsAI = useSelector(selectVsAI);
  const aiDifficulty = useSelector(selectAiDifficulty);
  const showStartPanel = useSelector(selectShowStartPanel);

  const initWorker = useCallback(() => {
    if (workerRef.current) workerRef.current.terminate();
    const worker = new window.Worker(STOCKFISH_WORKER_PATH);
    worker.onerror = () => {
      dispatch(setStockfishError(true));
      dispatch(setIsAiThinking(false));
      workerRef.current = null;
    };
    workerRef.current = worker;
    dispatch(setStockfishError(false));
  }, [dispatch]);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    dispatch(setIsAiThinking(false));
  }, [dispatch]);

  // Trigger AI move
  useEffect(() => {
    if (!vsAI || turn !== 'b' || winner || !workerRef.current || showStartPanel) return;
    dispatch(setIsAiThinking(true));
    const worker = workerRef.current;
    const fen = boardToFEN(board, 'b');
    worker.postMessage('ucinewgame');
    worker.postMessage('position fen ' + fen);
    worker.postMessage(`go depth ${AI_DEPTH_MAP[aiDifficulty]}`);
    worker.onmessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : '';
      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        if (!move || move.length < 4) return;
        const from = { row: 8 - parseInt(move[1]), col: move.charCodeAt(0) - 97 };
        const to = { row: 8 - parseInt(move[3]), col: move.charCodeAt(2) - 97 };
        const uciPromotion = move.length === 5 ? move[4] : null;
        setTimeout(() => {
          dispatch(setIsAiThinking(false));
          dispatch(applyAiMove({ from, to, uciPromotion }));
        }, AI_MOVE_DELAY_MS);
      }
    };
    return () => {
      if (workerRef.current) workerRef.current.onmessage = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, turn, vsAI, winner, showStartPanel, aiDifficulty]);

  // Terminate when game ends
  useEffect(() => {
    if (winner) terminateWorker();
  }, [winner, terminateWorker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => terminateWorker();
  }, [terminateWorker]);

  return { initWorker, terminateWorker };
}
