import React, { useState, useEffect, useRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Board.module.css';
import BoardSquare from './BoardSquare';
import { ANIM_STEP, ANIM_SCALE, ANIM_END_DELAY_MS } from '../../constants/ANIMATION';
import { PIECE_SYMBOLS } from '../../constants/PIECES';
import { clearMoveAnimation } from '../../store/slices/uiSlice';
import {
  selectBoard, selectTurn, selectValidMoves, selectLastMove, selectSelected,
} from '../../store/selectors/gameSelectors';
import {
  selectAnimateMoveFrom, selectAnimateMoveTo, selectAnimateMovePiece,
  selectBoardFlipped, selectIsAiThinking,
} from '../../store/selectors/uiSelectors';

const TURN_LABELS = { w: 'Blancas', b: 'Negras' };

const Board = memo(function Board({ onSquareClick, isKingInCheck }) {
  const dispatch = useDispatch();
  const board        = useSelector(selectBoard);
  const turn         = useSelector(selectTurn);
  const selected     = useSelector(selectSelected);
  const validMoves   = useSelector(selectValidMoves);
  const lastMove     = useSelector(selectLastMove);
  const animFrom     = useSelector(selectAnimateMoveFrom);
  const animTo       = useSelector(selectAnimateMoveTo);
  const animPiece    = useSelector(selectAnimateMovePiece);
  const boardFlipped = useSelector(selectBoardFlipped);
  const isAiThinking = useSelector(selectIsAiThinking);

  const [animProgress, setAnimProgress] = useState(null);
  const boardRef = useRef();

  useEffect(() => {
    if (animFrom) setAnimProgress(0);
  }, [animFrom]);

  useEffect(() => {
    if (animProgress === null) return;
    if (animProgress < 1) {
      const raf = requestAnimationFrame(() =>
        setAnimProgress(p => Math.min(1, p + ANIM_STEP))
      );
      return () => cancelAnimationFrame(raf);
    }
    const t = setTimeout(() => {
      setAnimProgress(null);
      dispatch(clearMoveAnimation());
    }, ANIM_END_DELAY_MS);
    return () => clearTimeout(t);
  }, [animProgress, dispatch]);

  // Find king in check
  let kingInCheck = null;
  for (let r = 0; r < 8 && !kingInCheck; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === turn + 'k') { kingInCheck = { row: r, col: c }; break; }
    }
  }
  if (kingInCheck && !isKingInCheck(board, turn)) kingInCheck = null;

  // Animated piece overlay — accounts for board flip
  function getAnimStyle() {
    if (!animFrom || animProgress === null) return null;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const size = rect.width / 8;
    const fromVisRow = boardFlipped ? 7 - animFrom.row : animFrom.row;
    const fromVisCol = boardFlipped ? 7 - animFrom.col : animFrom.col;
    const toVisRow   = boardFlipped ? 7 - animTo.row   : animTo.row;
    const toVisCol   = boardFlipped ? 7 - animTo.col   : animTo.col;
    const dx = (toVisCol - fromVisCol) * size * animProgress;
    const dy = (toVisRow - fromVisRow) * size * animProgress;
    return {
      position: 'absolute',
      left: fromVisCol * size,
      top:  fromVisRow * size,
      width: size,
      height: size,
      pointerEvents: 'none',
      transform: `scale(${ANIM_SCALE}) translate(${dx}px, ${dy}px)`,
      zIndex: 20,
    };
  }

  const animStyle = getAnimStyle();

  const isLastMoveSq = (r, c) =>
    lastMove &&
    ((lastMove.from.row === r && lastMove.from.col === c) ||
     (lastMove.to.row   === r && lastMove.to.col   === c));

  return (
    <div className={styles.boardOuter}>
      <div className={styles.board} ref={boardRef} style={{ position: 'relative' }}>
        {animStyle && animPiece && (
          <div
            className={`${styles.piece} ${animPiece[0] === 'w' ? styles.white : styles.black} ${styles.moving}`}
            style={animStyle}
          >
            {PIECE_SYMBOLS[animPiece]}
          </div>
        )}

        {[...Array(8)].flatMap((_, dr) =>
          [...Array(8)].map((_, dc) => {
            const rowIndex = boardFlipped ? 7 - dr : dr;
            const colIndex = boardFlipped ? 7 - dc : dc;

            // Coordinate labels
            const rankLabel = dc === 0
              ? String(boardFlipped ? dr + 1 : 8 - dr)
              : null;
            const fileLabel = dr === 7
              ? String.fromCharCode(97 + (boardFlipped ? 7 - dc : dc))
              : null;

            return (
              <BoardSquare
                key={`${rowIndex}-${colIndex}`}
                rowIndex={rowIndex}
                colIndex={colIndex}
                piece={board[rowIndex][colIndex]}
                isSelected={selected?.row === rowIndex && selected?.col === colIndex}
                isValid={validMoves?.some(m => m.row === rowIndex && m.col === colIndex)}
                isLastMove={isLastMoveSq(rowIndex, colIndex)}
                hidePiece={animProgress !== null && animFrom?.row === rowIndex && animFrom?.col === colIndex}
                isInCheck={kingInCheck?.row === rowIndex && kingInCheck?.col === colIndex}
                onClick={onSquareClick}
                rankLabel={rankLabel}
                fileLabel={fileLabel}
              />
            );
          })
        )}
      </div>

      <div className={styles.statusBar}>
        {isAiThinking ? (
          <div className={styles.aiThinking}>
            <span>IA calculando</span>
            <div className={styles.thinkingDots}>
              <span /><span /><span />
            </div>
          </div>
        ) : (
          <div className={styles.turnIndicator}>
            Turno:&nbsp;<strong>{TURN_LABELS[turn]}</strong>
          </div>
        )}
      </div>
    </div>
  );
});

export default Board;
