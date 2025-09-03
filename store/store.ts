import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { userReducer } from "./userSlice";
import persistReducer from "redux-persist/es/persistReducer";
import { workflowReducer } from "./workflowSlice";

const peristConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
  workflow: workflowReducer,
});

const persistedReducer = persistReducer(peristConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
