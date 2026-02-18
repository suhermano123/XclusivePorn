import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // Agregaremos reducers aquí cuando sean necesarios
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
