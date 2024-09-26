import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  success: null,
  error: null,
  confirmation: null,
  isLoading: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setSuccessMessage: (state, action) => {
      state.success = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.error = action.payload;
    },
    setConfirmationMessage: (state, action) => {
      state.confirmation = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

export const { setSuccessMessage, setErrorMessage, setConfirmationMessage, setIsLoading } =
  notificationSlice.actions;

export default notificationSlice.reducer;
