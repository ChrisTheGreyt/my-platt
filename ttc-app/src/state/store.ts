import { configureStore, Middleware } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Import the auth reducer
import globalReducer from "./index"; // Import your other reducers
import projectReducer from "./projectSlice";

// export const store = configureStore({
//     reducer: {
//         auth: authReducer, // Add the auth reducer here
//         global: globalReducer,
//         project: projectReducer,
//     },
// });

const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.log("Dispatching action:", action);
  const result = next(action);
  console.log("New state after dispatch:", store.getState());
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer, // Add your reducers here
    project: projectReducer,
    global: globalReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
