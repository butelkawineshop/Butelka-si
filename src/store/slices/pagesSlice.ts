import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Page } from '@butelkawineshop/types'
import { payloadClient } from '@/utilities/payloadClient'

interface PagesState {
  items: Page[]
  currentPage: Page | null
  isLoading: boolean
  error: string | null
}

const initialState: PagesState = {
  items: [],
  currentPage: null,
  isLoading: false,
  error: null,
}

export const fetchPagesAsync = createAsyncThunk('pages/fetchPages', async () => {
  const response = await payloadClient.find<Page>({
    collection: 'pages',
    depth: 1,
  })
  return response
})

export const fetchPageBySlugAsync = createAsyncThunk(
  'pages/fetchPageBySlug',
  async (slug: string) => {
    const response = await payloadClient.findBySlug<Page>({
      collection: 'pages',
      slug,
      depth: 2,
    })
    return response
  },
)

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPagesAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPagesAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.docs
      })
      .addCase(fetchPagesAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch pages'
      })
      .addCase(fetchPageBySlugAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPageBySlugAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPage = action.payload
      })
      .addCase(fetchPageBySlugAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch page'
      })
  },
})

export default pagesSlice.reducer
