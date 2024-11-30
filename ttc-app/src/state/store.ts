import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "./index"; // Adjust path as necessary

// Configure the store with your reducer(s)
export const store = configureStore({
    reducer: {
        global: globalReducer,
    },
});

// Export types for use in the application
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
