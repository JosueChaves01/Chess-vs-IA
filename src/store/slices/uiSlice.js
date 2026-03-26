import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selected: null,
    showStartPanel: true,
    showSummary: false,
    animateMoveFrom: null,
    animateMoveTo: null,
    animateMovePiece: null,
    timer: 0,
    timerActive: false,
    boardFlipped: false,
  },
  reducers: {
    setSelected(state, action) { state.selected = action.payload; },
    clearSelected(state) { state.selected = null; },
    setShowStartPanel(state, action) { state.showStartPanel = action.payload; },
    setShowSummary(state, action) { state.showSummary = action.payload; },
    triggerMoveAnimation(state, action) {
      state.animateMoveFrom = action.payload.from;
      state.animateMoveTo = action.payload.to;
      state.animateMovePiece = action.payload.piece;
    },
    clearMoveAnimation(state) {
      state.animateMoveFrom = null;
      state.animateMoveTo = null;
      state.animateMovePiece = null;
    },
    incrementTimer(state) { state.timer += 1; },
    setTimerActive(state, action) { state.timerActive = action.payload; },
    resetTimerState(state) { state.timer = 0; state.timerActive = false; },
    toggleBoardFlip(state) { state.boardFlipped = !state.boardFlipped; },
  },
});

export const {
  setSelected, clearSelected,
  setShowStartPanel, setShowSummary,
  triggerMoveAnimation, clearMoveAnimation,
  incrementTimer, setTimerActive, resetTimerState,
  toggleBoardFlip,
} = uiSlice.actions;
export default uiSlice.reducer;
