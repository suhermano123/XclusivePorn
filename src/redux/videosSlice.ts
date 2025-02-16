import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { VideoItem } from '@/api/types/videoTypes'; // Asegúrate de que VideoItem esté importado correctamente

// Define el estado correctamente, incluyendo un arreglo de videos.
export interface VideosState {
  videos: VideoItem[]; // videos será un arreglo de VideoItem
}

// Estado inicial con un arreglo vacío de videos.
const initialState: VideosState = {
  videos: [],
};

// Creación del slice
export const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    // Acción para agregar un arreglo de videos
    addVideos: (state, action: PayloadAction<VideoItem[]>) => {
      state.videos = action.payload; // Establecer directamente el arreglo de videos
    },
    // Si necesitas agregar más videos a la lista existente, usa una acción de "append"
    appendVideos: (state, action: PayloadAction<VideoItem[]>) => {
      state.videos.push(...action.payload); // Añadir los nuevos videos al arreglo existente
    },
  },
});

// Exportar las acciones y el reductor
export const { addVideos, appendVideos } = videosSlice.actions;
export default videosSlice.reducer;
