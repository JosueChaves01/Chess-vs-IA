import React from 'react'
import './App.css'
import GameLayout from './features/game/GameLayout'
import { useGameEnd } from './hooks/useGameEnd'
import { useTimer } from './hooks/useTimer'

function App() {
  useGameEnd();
  useTimer();
  return (
    <div className="App">
      <GameLayout />
    </div>
  );
}

export default App
