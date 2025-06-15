import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import postsReducer from './slices/postsSlice'
import pagesReducer from './slices/pagesSlice'
import languageReducer from './slices/languageSlice'
import filterReducer from './slices/filterSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    pages: pagesReducer,
    language: languageReducer,
    filter: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
