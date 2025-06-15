import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Locale = 'en' | 'sl'

interface LanguageState {
  currentLanguage: Locale
  availableLanguages: Locale[]
}

const initialState: LanguageState = {
  currentLanguage: 'sl',
  availableLanguages: ['sl', 'en'],
}

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Locale>) => {
      state.currentLanguage = action.payload
    },
  },
})

export const { setLanguage } = languageSlice.actions
export default languageSlice.reducer
