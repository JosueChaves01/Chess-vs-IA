import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import styles from './GameSummary.module.css';
import { useFormatTime } from '../../hooks/useFormatTime';
import { selectWinner, selectEndReason, selectMoveHistory } from '../../store/selectors/gameSelectors';
import { selectTimer } from '../../store/selectors/uiSelectors';
import { WINNER_LABELS, END_REASON_LABELS, END_REASON } from '../../constants/GAME';
import { PIECE_SYMBOLS } from '../../constants/PIECES';

const GameSummary = memo(function GameSummary({ onRestart, onClose }) {
  const winner      = useSelector(selectWinner);
  const endReason   = useSelector(selectEndReason);
  const timer       = useSelector(selectTimer);
  const moveHistory = useSelector(selectMoveHistory);
  const formatTime  = useFormatTime();

  let title      = '';
  let reasonText = '';
  let icon       = '';

  if (winner === 'draw') {
    title      = '¡Empate!';
    reasonText = END_REASON_LABELS[endReason] ?? 'Empate';
    icon       = PIECE_SYMBOLS['wr'] ?? '½';
  } else if (endReason === END_REASON.SURRENDER) {
    title      = '¡Rendición!';
    reasonText = END_REASON_LABELS[endReason];
    icon       = PIECE_SYMBOLS['wk'];
  } else {
    title      = '¡Jaque Mate!';
    reasonText = `Ganador: ${WINNER_LABELS[winner] ?? winner}`;
    icon       = PIECE_SYMBOLS[winner + 'k'];
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Cerrar">×</button>

        <div className={styles.resultIcon}>{icon}</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.reason}>{reasonText}</p>

        <div className={styles.divider} />

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{formatTime(timer)}</span>
            <span className={styles.statLabel}>Tiempo</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{moveHistory.length}</span>
            <span className={styles.statLabel}>Movimientos</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onRestart}>Nueva Partida</button>
          <button className={styles.secondaryBtn} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
});

export default GameSummary;
