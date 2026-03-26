import React, { memo } from 'react';
import styles from './Board.module.css';
import { PIECE_SYMBOLS } from '../../constants/PIECES';

const BoardSquare = memo(function BoardSquare({
  rowIndex, colIndex, piece, isSelected, isValid, hidePiece,
  isInCheck, isLastMove, onClick, rankLabel, fileLabel,
}) {
  const isLight = (rowIndex + colIndex) % 2 === 0;
  const classNames = [
    styles.square,
    isLight ? styles.light : styles.dark,
    isSelected ? styles.selected : '',
    isInCheck ? styles.inCheck : '',
    isLastMove && !isSelected ? styles.lastMove : '',
    isValid ? (piece ? styles.validCapture : styles.validMove) : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={() => onClick(rowIndex, colIndex)}>
      {rankLabel && <span className={styles.rankLabel}>{rankLabel}</span>}
      {fileLabel && <span className={styles.fileLabel}>{fileLabel}</span>}
      {!hidePiece && piece && (
        <div className={`${styles.piece} ${piece[0] === 'w' ? styles.white : styles.black}`}>
          {PIECE_SYMBOLS[piece]}
        </div>
      )}
    </div>
  );
});

export default BoardSquare;
