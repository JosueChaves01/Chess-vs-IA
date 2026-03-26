import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import styles from './CapturedPieces.module.css';
import { PIECE_SYMBOLS } from '../../constants/PIECES';
import { selectCapturedWhite, selectCapturedBlack } from '../../store/selectors/gameSelectors';

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const calcScore = (pieces) => pieces.reduce((sum, p) => sum + (PIECE_VALUES[p[1]] || 0), 0);

const CapturedPieces = memo(function CapturedPieces() {
  const capturedWhite = useSelector(selectCapturedWhite); // black pieces captured by white
  const capturedBlack = useSelector(selectCapturedBlack); // white pieces captured by black

  const whiteScore = calcScore(capturedWhite);
  const blackScore = calcScore(capturedBlack);
  const advantage  = whiteScore - blackScore;

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {/* Left: black pieces captured by white */}
        <div className={styles.group}>
          {capturedWhite.map((p, i) => (
            <span key={i} className={`${styles.piece} ${styles.whitePiece}`}>
              {PIECE_SYMBOLS[p]}
            </span>
          ))}
          {advantage > 0 && (
            <span className={styles.advantage}>+{advantage}</span>
          )}
        </div>

        {/* Right: white pieces captured by black */}
        <div className={`${styles.group} ${styles.right}`}>
          {advantage < 0 && (
            <span className={styles.advantage}>+{Math.abs(advantage)}</span>
          )}
          {capturedBlack.map((p, i) => (
            <span key={i} className={`${styles.piece} ${styles.blackPiece}`}>
              {PIECE_SYMBOLS[p]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default CapturedPieces;
