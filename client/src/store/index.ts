import { configureStore } from '@reduxjs/toolkit';
import { adminReducer, userReducer, notificationsReducer } from './slices';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    user: userReducer,
    notifications: notificationsReducer
  }
});
