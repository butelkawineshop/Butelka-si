import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type FilterType =
  | 'wine-countries'
  | 'aromas'
  | 'climates'
  | 'foods'
  | 'grape-varieties'
  | 'moods'
  | 'regions'
  | 'styles'
  | 'tags'
  | 'wineries'

export interface PriceRange {
  minPrice?: number
  maxPrice?: number
}

export interface TastingNoteRange {
  min?: number
  max?: number
}

export interface FilterState {
  filters: {
    [key in FilterType]?: string[]
  }
  priceRange: PriceRange
  tastingNotes: {
    dry?: TastingNoteRange
    ripe?: TastingNoteRange
    creamy?: TastingNoteRange
    oaky?: TastingNoteRange
    complex?: TastingNoteRange
    light?: TastingNoteRange
    smooth?: TastingNoteRange
    youthful?: TastingNoteRange
    energetic?: TastingNoteRange
    alcohol?: TastingNoteRange
  }
  sort: {
    field: string
    direction: 'asc' | 'desc'
  }
  currentCollection?: {
    id: string
    type: FilterType
  }
}

const initialState: FilterState = {
  filters: {},
  priceRange: {},
  tastingNotes: {},
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
}

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<{ type: FilterType; values: string[] }>,
    ) => {
      const { type, values } = action.payload
      if (values.length === 0) {
        delete state.filters[type]
      } else {
        state.filters[type] = values
      }
    },
    setPriceRange: (state, action: PayloadAction<PriceRange>) => {
      state.priceRange = action.payload
    },
    setTastingNoteRange: (
      state,
      action: PayloadAction<{ note: keyof FilterState['tastingNotes']; range: TastingNoteRange }>,
    ) => {
      const { note, range } = action.payload
      if (range.min === undefined && range.max === undefined) {
        delete state.tastingNotes[note]
      } else {
        state.tastingNotes[note] = range
      }
    },
    setSort: (
      state,
      action: PayloadAction<{ field: string; direction: 'asc' | 'desc' }>,
    ) => {
      state.sort = action.payload
    },
    setCurrentCollection: (
      state,
      action: PayloadAction<{ id: string; type: FilterType } | undefined>,
    ) => {
      state.currentCollection = action.payload
    },
    resetFilters: (state) => {
      state.filters = {}
      state.priceRange = {}
      state.tastingNotes = {}
      state.sort = {
        field: 'createdAt',
        direction: 'desc',
      }
    },
  },
})

export const {
  setFilter,
  setPriceRange,
  setTastingNoteRange,
  setSort,
  setCurrentCollection,
  resetFilters,
} = filterSlice.actions

export default filterSlice.reducer 