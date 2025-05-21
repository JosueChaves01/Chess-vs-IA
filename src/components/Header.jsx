import React, { useState, useRef, useEffect } from "react";
import "./Header.css";

const Header = ({ onSurrender, timer }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const handleMenuClick = () => setShowMenu((v) => !v);
  const handleSurrender = () => {
    setShowMenu(false);
    if (onSurrender) onSurrender();
  };

  // Cierra el menú si se hace click fuera
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Formatea el cronómetro mm:ss
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <header className="header">
      <div className="header__title">Chess vs IA</div>
      <div className="header__options">
        <span className="header__timer">{formatTime(timer)}</span>
        <div style={{ position: 'relative' }}>
          <button
            className="header__settings"
            aria-label="Opciones"
            onClick={handleMenuClick}
          >
            ⚙️
          </button>
          {showMenu && (
            <div ref={menuRef} className="header__dropdown" style={{ position: 'absolute', right: 0, top: '2.2em', background: '#222', color: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0003', minWidth: 120, zIndex: 10 }}>
              <button
                style={{ width: '100%', background: 'none', border: 'none', color: '#fff', padding: '0.7em 1em', textAlign: 'left', cursor: 'pointer', fontSize: 16 }}
                onClick={handleSurrender}
              >
                Rendirse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
