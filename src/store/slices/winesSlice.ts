import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Wine, WineVariant } from '@butelkawineshop/types'
import { payloadClient } from '@/utilities/payloadClient'

interface WinesState {
  items: Wine[]
  currentWine: Wine | null
  variants: WineVariant[]
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  filters: {
    region?: number
    style?: number
    priceRange?: string
    search?: string
  }
}

const initialState: WinesState = {
  items: [],
  currentWine: null,
  variants: [],
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  filters: {}
}

type WineFilters = {
  region?: number
  style?: number
  priceRange?: string
  search?: string
}

type WhereClause = {
  _status?: {
    equals: string
  }
  region?: {
    equals: number
  }
  style?: {
    equals: number
  }
  variants?: {
    details: {
      price: {
        less_than_equal: number
      }
    }
  }
  title?: {
    contains: string
  }
}

export const fetchWinesAsync = createAsyncThunk(
  'wines/fetchWines',
  async ({ 
    page = 1, 
    limit = 10,
    filters = {} 
  }: { 
    page?: number
    limit?: number
    filters?: WineFilters
  }) => {
    const where: WhereClause = {
      _status: {
        equals: 'published'
      }
    }

    // Add filters to where clause
    if (filters.region) {
      where.region = {
        equals: filters.region
      }
    }
    if (filters.style) {
      where.style = {
        equals: filters.style
      }
    }
    if (filters.priceRange) {
      where.variants = {
        details: {
          price: {
            less_than_equal: parseInt(filters.priceRange.split('-')[1])
          }
        }
      }
    }
    if (filters.search) {
      where.title = {
        contains: filters.search
      }
    }

    const response = await payloadClient.find<Wine>({
      collection: 'wines',
      where,
      page,
      limit,
      depth: 1,
    })
    return response
  }
)

export const fetchWineBySlugAsync = createAsyncThunk(
  'wines/fetchWineBySlug',
  async (slug: string) => {
    const response = await payloadClient.findBySlug<Wine>({
      collection: 'wines',
      slug,
      depth: 2,
    })
    return response
  }
)

export const fetchWineVariantsAsync = createAsyncThunk(
  'wines/fetchVariants',
  async (wineId: number) => {
    const response = await payloadClient.find<WineVariant>({
      collection: 'wine-variants',
      where: {
        wine: {
          equals: wineId
        }
      },
      depth: 1,
    })
    return response
  }
)

const winesSlice = createSlice({
  name: 'wines',
  initialState,
  reducers: {
    setFilters: (state, action: { payload: Partial<WineFilters> }) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      }
    },
    clearFilters: (state) => {
      state.filters = {}
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wines
      .addCase(fetchWinesAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWinesAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.docs
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.page
      })
      .addCase(fetchWinesAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch wines'
      })
      // Fetch single wine
      .addCase(fetchWineBySlugAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWineBySlugAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentWine = action.payload
      })
      .addCase(fetchWineBySlugAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch wine'
      })
      // Fetch variants
      .addCase(fetchWineVariantsAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWineVariantsAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.variants = action.payload.docs
      })
      .addCase(fetchWineVariantsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch variants'
      })
  }
})

export const { setFilters, clearFilters } = winesSlice.actions
export default winesSlice.reducer 