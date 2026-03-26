import React, { memo } from 'react';
import styles from './PromotionModal.module.css';
import { PIECE_SYMBOLS, PROMOTION_PIECES } from '../../constants/PIECES';

const PromotionModal = memo(function PromotionModal({ color, onSelect }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.label}>Elegir promoción</div>
        <div className={styles.pieces}>
          {PROMOTION_PIECES.map(type => (
            <button
              key={type}
              className={`${styles.piece} ${color === 'w' ? styles.white : styles.black}`}
              onClick={() => onSelect(type)}
            >
              {PIECE_SYMBOLS[color + type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default PromotionModal;
