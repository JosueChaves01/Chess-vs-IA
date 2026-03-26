import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import uiReducer from './slices/uiSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ui: uiReducer,
    ai: aiReducer,
  },
});
