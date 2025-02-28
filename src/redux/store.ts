import { configureStore } from "@reduxjs/toolkit";
import { videosSlice } from "./videosSlice";
import  { videosPostSlice } from "./PostVideoSlice";

export const store = configureStore({
  reducer: {
    videos: videosSlice.reducer,
    postVideos: videosPostSlice.reducer, // 🔥 Cambia "PostVideos" a "postVideos" (por convención)
  },
});

// 🔥 Exportar RootState para usar en useSelector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
