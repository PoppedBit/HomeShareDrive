import { createSlice } from '@reduxjs/toolkit';
import { FileInfo } from 'types/homehare';

interface HomeshareState {
  path: string;
  items: FileInfo[] | null;
}

const initialState: HomeshareState = {
  path: '/',
  items: null,
};

const homeshareSlice = createSlice({
  name: 'homeshare',
  initialState,
  reducers: {
    setPath: (state, action) => {
      console.log(action.payload)
      state.path = action.payload;
      state.items = null;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    }
  }
});

export const { setPath, setItems } = homeshareSlice.actions;

export default homeshareSlice.reducer;
