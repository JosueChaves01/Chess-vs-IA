import React, { memo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from './MoveHistory.module.css';
import { PIECE_SYMBOLS } from '../../constants/PIECES';
import { selectMoveHistory } from '../../store/selectors/gameSelectors';

function fmtSq(row, col) {
  return `${String.fromCharCode(97 + col)}${8 - row}`;
}

const MoveHistory = memo(function MoveHistory() {
  const moveHistory = useSelector(selectMoveHistory);
  const listRef = useRef();

  // Auto-scroll to bottom on new move
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  // Group into pairs: [white, black?]
  const pairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push([moveHistory[i], moveHistory[i + 1] ?? null]);
  }

  const isLatest = (globalIdx) => globalIdx === moveHistory.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Historial</div>
      </div>

      {moveHistory.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>♙</span>
          Sin movimientos
        </div>
      ) : (
        <ol className={styles.list} ref={listRef}>
          {pairs.map(([white, black], pairIdx) => {
            const wIdx = pairIdx * 2;
            const bIdx = pairIdx * 2 + 1;
            return (
              <li key={pairIdx} className={styles.pairRow}>
                <span className={styles.moveNum}>{pairIdx + 1}</span>

                {/* White move */}
                <span className={`${styles.moveCell} ${styles.white} ${isLatest(wIdx) ? styles.latest : ''}`}>
                  <span className={styles.pieceIcon}>{PIECE_SYMBOLS[white.piece]}</span>
                  {fmtSq(white.from.row, white.from.col)}
                  {white.capture
                    ? <span className={styles.capture}>×</span>
                    : <span style={{ opacity: 0.4 }}>→</span>
                  }
                  {fmtSq(white.to.row, white.to.col)}
                  {white.promotion ? `=${white.promotion.toUpperCase()}` : ''}
                </span>

                {/* Black move */}
                {black ? (
                  <span className={`${styles.moveCell} ${isLatest(bIdx) ? styles.latest : ''}`}>
                    <span className={styles.pieceIcon}>{PIECE_SYMBOLS[black.piece]}</span>
                    {fmtSq(black.from.row, black.from.col)}
                    {black.capture
                      ? <span className={styles.capture}>×</span>
                      : <span style={{ opacity: 0.4 }}>→</span>
                    }
                    {fmtSq(black.to.row, black.to.col)}
                    {black.promotion ? `=${black.promotion.toUpperCase()}` : ''}
                  </span>
                ) : (
                  <span className={styles.moveCell} />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
});

export default MoveHistory;
