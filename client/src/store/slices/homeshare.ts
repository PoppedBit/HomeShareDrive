import { createSlice } from '@reduxjs/toolkit';
import { TODO } from 'types/types';

interface HomeshareState {
  path: string;
  items: TODO[] | null;
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
