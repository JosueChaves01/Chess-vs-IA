import { createSlice } from '@reduxjs/toolkit';

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    vsAI: false,
    aiDifficulty: 'medium',
    stockfishReady: false,
    stockfishError: false,
    isAiThinking: false,
  },
  reducers: {
    setVsAI(state, action) { state.vsAI = action.payload; },
    setAiDifficulty(state, action) { state.aiDifficulty = action.payload; },
    setStockfishReady(state, action) { state.stockfishReady = action.payload; },
    setStockfishError(state, action) { state.stockfishError = action.payload; },
    setIsAiThinking(state, action) { state.isAiThinking = action.payload; },
  },
});

export const { setVsAI, setAiDifficulty, setStockfishReady, setStockfishError, setIsAiThinking } = aiSlice.actions;
export default aiSlice.reducer;
