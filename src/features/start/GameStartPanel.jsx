import React, { memo } from 'react';
import styles from './GameStartPanel.module.css';
import { PIECE_SYMBOLS } from '../../constants/PIECES';

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   name: 'Novato',  elo: '~800',   piece: 'wp' },
  { value: 'medium', name: 'Avanzado', elo: '~1500',  piece: 'wn' },
  { value: 'hard',   name: 'Maestro', elo: '~2400+', piece: 'wk' },
];

const GameStartPanel = memo(function GameStartPanel({ onStart, vsAI, setVsAI, aiDifficulty, setAiDifficulty }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.hero}>{PIECE_SYMBOLS['wk']}</div>
        <h2 className={styles.title}>Chess vs IA</h2>
        <p className={styles.subtitle}>El juego de los reyes</p>
        <div className={styles.divider} />

        <div className={styles.sectionLabel}>Modo de juego</div>
        <div className={styles.modeGrid}>
          <div
            className={`${styles.modeCard} ${vsAI ? styles.active : ''}`}
            onClick={() => setVsAI(true)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setVsAI(true)}
          >
            <span className={styles.modeIcon}>{PIECE_SYMBOLS['bk']}</span>
            <span className={styles.modeLabel}>vs Inteligencia Artificial</span>
          </div>
          <div
            className={`${styles.modeCard} ${!vsAI ? styles.active : ''}`}
            onClick={() => setVsAI(false)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setVsAI(false)}
          >
            <span className={styles.modeIcon}>{PIECE_SYMBOLS['wq']}</span>
            <span className={styles.modeLabel}>Dos Jugadores</span>
          </div>
        </div>

        {vsAI && (
          <>
            <div className={styles.sectionLabel}>Dificultad</div>
            <div className={styles.diffGrid}>
              {DIFFICULTY_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  className={`${styles.diffCard} ${aiDifficulty === opt.value ? styles.active : ''}`}
                  onClick={() => setAiDifficulty(opt.value)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setAiDifficulty(opt.value)}
                >
                  <span className={styles.diffIcon}>{PIECE_SYMBOLS[opt.piece]}</span>
                  <span className={styles.diffName}>{opt.name}</span>
                  <span className={styles.diffElo}>{opt.elo}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button className={styles.startBtn} onClick={onStart}>
          Comenzar Partida
        </button>
      </div>
    </div>
  );
});

export default GameStartPanel;
