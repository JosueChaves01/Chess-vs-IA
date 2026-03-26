import React, { useState, useRef, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Header.module.css';
import { useFormatTime } from '../../hooks/useFormatTime';
import { selectTimer } from '../../store/selectors/uiSelectors';
import { toggleBoardFlip } from '../../store/slices/uiSlice';

const Header = memo(function Header({ onSurrender }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const dispatch = useDispatch();
  const timer = useSelector(selectTimer);
  const formatTime = useFormatTime();

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>♟</span>
        <span className={styles.title}>Chess vs IA</span>
      </div>

      <div className={styles.options}>
        <span className={styles.timer}>{formatTime(timer)}</span>

        <button
          className={styles.iconBtn}
          title="Voltear tablero"
          aria-label="Voltear tablero"
          onClick={() => dispatch(toggleBoardFlip())}
        >
          ↕
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className={styles.settings}
            aria-label="Opciones"
            onClick={() => setShowMenu(v => !v)}
          >
            ⚙
          </button>
          {showMenu && (
            <div ref={menuRef} className={styles.dropdown}>
              <button onClick={() => { setShowMenu(false); onSurrender?.(); }}>
                Rendirse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
