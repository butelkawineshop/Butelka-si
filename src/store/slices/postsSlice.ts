import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Post } from '@butelkawineshop/types'
import { payloadClient } from '@/utilities/payloadClient'

interface PostsState {
  items: Post[]
  currentPost: Post | null
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
}

const initialState: PostsState = {
  items: [],
  currentPost: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
}

export const fetchPostsAsync = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => {
    const response = await payloadClient.find<Post>({
      collection: 'posts',
      page,
      limit,
      depth: 1,
    })
    return response
  },
)

export const fetchPostBySlugAsync = createAsyncThunk(
  'posts/fetchPostBySlug',
  async (slug: string) => {
    const response = await payloadClient.findBySlug<Post>({
      collection: 'posts',
      slug,
      depth: 2,
    })
    return response
  },
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPostsAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.docs
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.page
      })
      .addCase(fetchPostsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch posts'
      })
      .addCase(fetchPostBySlugAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPostBySlugAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPost = action.payload
      })
      .addCase(fetchPostBySlugAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch post'
      })
  },
})

export default postsSlice.reducer
