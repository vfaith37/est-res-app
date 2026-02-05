import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./api/apiSlice";
import authReducer from "./slices/authSlice";
import { loadState, saveState } from "./mmkvStorage";
import { rtkQueryToastMiddleware } from "./middleware/rtkQueryToastMiddleware";

// Load persisted state
const preloadedState = {
  auth: loadState("auth") || undefined,
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    })
      .concat(api.middleware)
      .concat(rtkQueryToastMiddleware),
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

// Save auth state to MMKV
let currentAuthState = store.getState().auth;

store.subscribe(() => {
  const previousAuthState = currentAuthState;
  currentAuthState = store.getState().auth;

  if (previousAuthState !== currentAuthState) {
    saveState("auth", currentAuthState);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

