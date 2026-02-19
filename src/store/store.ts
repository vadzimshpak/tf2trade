import { configureStore } from "@reduxjs/toolkit";
import botReducer from "@/src/store/botSlice";
import userReducer from "@/src/store/userSlice";
import modalReducer from "@/src/store/modalSlice";

export const store = configureStore({
  reducer: {
    bot: botReducer,
    user: userReducer,
    modal: modalReducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;