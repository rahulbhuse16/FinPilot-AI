import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import authReducer from "./authSlice";
import notificationReducer from './notifications'

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    auth: authReducer,
    notifications:notificationReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
