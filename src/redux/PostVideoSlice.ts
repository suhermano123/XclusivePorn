import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { VideoItem } from '@/api/types/videoTypes'; // Asegúrate de que VideoItem esté importado correctamente
import { PostVideo } from '@/api/types/PostTypes';

// Define el estado correctamente, incluyendo un arreglo de videos.
export interface PostVideosState {
  movies: PostVideo[]; // videos será un arreglo de VideoItem
}

// Estado inicial con un arreglo vacío de videos.
const initialState: PostVideosState = {
  movies: [],
};

// Creación del slice
export const videosPostSlice = createSlice({
  name: 'postVideo',
  initialState,
  reducers: {
    // Acción para agregar un arreglo de videos
    addPostVideos: (state, action: PayloadAction<PostVideo[]>) => {
      state.movies = action.payload; // Establecer directamente el arreglo de videos
    },
    // Si necesitas agregar más videos a la lista existente, usa una acción de "append"
    appendPostVideos: (state, action: PayloadAction<PostVideo[]>) => {
      state.movies.push(...action.payload); // Añadir los nuevos videos al arreglo existente
    },
  },
});

// Exportar las acciones y el reductor
export const { addPostVideos, appendPostVideos } = videosPostSlice.actions;
export default videosPostSlice.reducer;
