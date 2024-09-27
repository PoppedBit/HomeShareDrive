import { createSlice } from '@reduxjs/toolkit';

interface HomeshareState {
  path: string;
}

const initialState: HomeshareState = {
  path: '/',
};

const homeshareSlice = createSlice({
  name: 'homeshare',
  initialState,
  reducers: {
    setPath: (state, action) => {
      state.path = action.payload;
    }
  }
});

export const { setPath } = homeshareSlice.actions;

export default homeshareSlice.reducer;
