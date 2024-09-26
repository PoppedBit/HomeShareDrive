import { createSlice } from '@reduxjs/toolkit';
import { User } from 'types/admin';

interface AdminState {
  users: User[] | undefined;
}

const initialState: AdminState = {
  users: undefined
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    updateUser: (state, action) => {
      const updatedUser = action.payload;
      const index = state.users!.findIndex((user) => user.id === updatedUser.id);
      if (index !== -1) {
        state.users?.splice(index, 1, updatedUser);
      }
    }
  }
});

export const { setUsers, updateUser } = adminSlice.actions;

export default adminSlice.reducer;
