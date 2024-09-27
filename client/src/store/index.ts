import { configureStore } from '@reduxjs/toolkit';
import { adminReducer, homeshareReducer, userReducer, notificationsReducer } from './slices';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    homeshare: homeshareReducer,
    user: userReducer,
    notifications: notificationsReducer
  }
});
