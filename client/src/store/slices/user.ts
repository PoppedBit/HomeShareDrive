import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  username: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return {
        ...state,
        ...action.payload
      };
    },
    // @ts-ignore TODO
    clearUser: (state) => {
      state = {
        ...initialState
      };
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
