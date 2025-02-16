// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { videosSlice } from './videosSlice';

export const store = configureStore({
  reducer: {
    videos: videosSlice.reducer,
  },
});
