import { createSlice } from '@reduxjs/toolkit';
import { FileInfo } from 'types/homehare';

interface HomeshareState {
  path: string;
  items: FileInfo[] | null;
}

const initialState: HomeshareState = {
  path: '/',
  items: null
};

const homeshareSlice = createSlice({
  name: 'homeshare',
  initialState,
  reducers: {
    setPath: (state, action) => {
      state.path = action.payload;
      state.items = null;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
    removeItem: (state, action) => {
      const path = action.payload;
      state.items = state.items!.filter((item) => item.path !== path);
    }
  }
});

export const { setPath, setItems, removeItem } = homeshareSlice.actions;

export default homeshareSlice.reducer;
