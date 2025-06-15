'use client'

import { createContext, useContext, useEffect, useReducer, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { WineVariant } from '@butelkawineshop/types'

interface CartItem {
  wineVariant: number | WineVariant
  quantity: number
  addedAt: string
  id?: string | null
}

export interface CartState {
  items: CartItem[]
  updatedAt?: string
  id?: string
  user?: {
    id: string
  } | null
  sessionId?: string | null
}

interface UserWithCart {
  id: string
  cart?: CartState
}

type CartAction =
  | { type: 'SET_CART'; payload: CartState }
  | { type: 'MERGE_CART'; payload: CartState }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { wineVariantId: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_CART' }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return action.payload

    case 'MERGE_CART': {
      const { payload: incomingCart } = action
      const syncedItems: CartItem[] = [
        ...(state?.items || []),
        ...(incomingCart?.items || []),
      ].reduce((acc: CartItem[], item) => {
        if (!item.wineVariant) return acc

        const wineVariantId =
          typeof item.wineVariant === 'object' ? item.wineVariant.id : item.wineVariant
        const indexInAcc = acc.findIndex(
          ({ wineVariant }) =>
            (typeof wineVariant === 'object' ? wineVariant.id : wineVariant) === wineVariantId,
        )

        if (indexInAcc > -1) {
          const existingItem = acc[indexInAcc]
          if (existingItem) {
            acc[indexInAcc] = {
              ...existingItem,
              quantity: (existingItem.quantity || 0) + (item.quantity || 0),
            }
          }
        } else {
          acc.push({
            wineVariant: item.wineVariant,
            quantity: item.quantity || 0,
            addedAt: item.addedAt || new Date().toISOString(),
            id: item.id,
          })
        }
        return acc
      }, [])

      return {
        ...state,
        items: syncedItems,
      }
    }

    case 'ADD_ITEM': {
      const { payload: incomingItem } = action
      if (!incomingItem.wineVariant) return state

      const wineVariantId =
        typeof incomingItem.wineVariant === 'object'
          ? incomingItem.wineVariant.id
          : incomingItem.wineVariant

      const indexInCart = state?.items?.findIndex(
        ({ wineVariant }) =>
          (typeof wineVariant === 'object' ? wineVariant.id : wineVariant) === wineVariantId,
      )

      const withAddedItem = [...(state?.items || [])]

      if (indexInCart === -1) {
        withAddedItem.push({
          wineVariant: incomingItem.wineVariant,
          quantity: incomingItem.quantity,
          addedAt: incomingItem.addedAt,
          id: incomingItem.id,
        })
      } else if (typeof indexInCart === 'number' && indexInCart > -1) {
        const existingItem = withAddedItem[indexInCart]
        if (existingItem) {
          withAddedItem[indexInCart] = {
            ...existingItem,
            quantity: existingItem.quantity + incomingItem.quantity,
          }
        }
      }

      return {
        ...state,
        items: withAddedItem,
      }
    }

    case 'UPDATE_QUANTITY': {
      const { wineVariantId, quantity } = action.payload
      const withUpdatedQuantity = { ...state }

      const indexInCart = state?.items?.findIndex(
        ({ wineVariant }) =>
          (typeof wineVariant === 'object' ? wineVariant.id : wineVariant) === wineVariantId,
      )

      if (typeof indexInCart === 'number' && withUpdatedQuantity.items && indexInCart > -1) {
        const existingItem = withUpdatedQuantity.items[indexInCart]
        if (existingItem) {
          withUpdatedQuantity.items[indexInCart] = {
            ...existingItem,
            quantity: Math.max(0, quantity),
          }
        }
      }

      return withUpdatedQuantity
    }

    case 'REMOVE_ITEM': {
      const { payload: wineVariantId } = action
      const withRemovedItem = { ...state }

      const indexInCart = state?.items?.findIndex(
        ({ wineVariant }) =>
          (typeof wineVariant === 'object' ? wineVariant.id : wineVariant) === wineVariantId,
      )

      if (typeof indexInCart === 'number' && withRemovedItem.items && indexInCart > -1) {
        withRemovedItem.items.splice(indexInCart, 1)
      }

      return withRemovedItem
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      }

    default:
      return state
  }
}

interface CartContextType {
  cart: CartState
  isLoading: boolean
  addToCart: (wineVariantId: number, quantity?: number) => Promise<void>
  updateQuantity: (wineVariantId: number, quantity: number) => Promise<void>
  removeItem: (wineVariantId: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartItemCount: () => number
  hasInitializedCart: boolean
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    updatedAt: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth() as { user: UserWithCart | null }
  const [hasInitializedCart, setHasInitializedCart] = useState(false)

  // Load cart from localStorage for guest users
  useEffect(() => {
    const loadGuestCart = async () => {
      if (!user && typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart)

            // Fetch full wine variant data for each item
            const itemsWithFullData = await Promise.all(
              parsedCart.items.map(async (item: CartItem) => {
                if (typeof item.wineVariant === 'number') {
                  try {
                    const response = await fetch(`/api/wine-variants/${item.wineVariant}`)
                    if (!response.ok) throw new Error('Failed to fetch wine variant')
                    const wineVariant = await response.json()
                    return {
                      ...item,
                      wineVariant,
                    }
                  } catch (error) {
                    console.error('Error fetching wine variant:', error)
                    return null
                  }
                }
                return item
              }),
            )

            // Filter out any failed fetches
            const validItems = itemsWithFullData.filter(Boolean)

            dispatch({
              type: 'SET_CART',
              payload: {
                ...parsedCart,
                items: validItems,
              },
            })
          } catch (error) {
            console.error('Error parsing saved cart:', error)
          }
        }
      }
    }

    loadGuestCart()
  }, [user])

  // Initial cart fetch for logged-in users
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setIsLoading(false)
        setHasInitializedCart(true)
        return
      }

      try {
        const response = await fetch('/api/cart')
        const data = await response.json()

        if (data.success && data.cart) {
          dispatch({
            type: 'SET_CART',
            payload: data.cart,
          })
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setIsLoading(false)
        setHasInitializedCart(true)
      }
    }

    fetchCart()
  }, [user])

  // Sync cart with server when user changes
  useEffect(() => {
    if (!hasInitializedCart) return

    if (user?.cart) {
      dispatch({
        type: 'MERGE_CART',
        payload: user.cart,
      })
    }
  }, [user, hasInitializedCart])

  // Sync cart to server or localStorage
  useEffect(() => {
    if (!hasInitializedCart) return

    const syncCartToServer = async () => {
      try {
        const flattenedCart = {
          ...cart,
          items: cart?.items
            ?.map((item) => {
              if (!item?.wineVariant || typeof item?.wineVariant !== 'object') {
                return null
              }

              return {
                ...item,
                wineVariant: item?.wineVariant?.id,
                quantity: typeof item?.quantity === 'number' ? item?.quantity : 0,
              }
            })
            .filter(Boolean),
        }

        if (user) {
          await fetch(`/api/users/${user.id}`, {
            credentials: 'include',
            method: 'PATCH',
            body: JSON.stringify({
              cart: flattenedCart,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })
        } else {
          localStorage.setItem('cart', JSON.stringify(flattenedCart))
        }
      } catch (error) {
        console.error('Error syncing cart:', error)
      }
    }

    syncCartToServer()
  }, [cart, user, hasInitializedCart])

  const addToCart = async (wineVariantId: number, quantity: number = 1) => {
    try {
      // First fetch the wine variant to get full data
      const response = await fetch(`/api/wine-variants/${wineVariantId}`)
      if (!response.ok) throw new Error('Failed to fetch wine variant')
      const wineVariant = await response.json()

      const newItem = {
        wineVariant,
        quantity,
        addedAt: new Date().toISOString(),
      }

      dispatch({ type: 'ADD_ITEM', payload: newItem })
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  const updateQuantity = async (wineVariantId: number, quantity: number) => {
    try {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: {
          wineVariantId,
          quantity,
        },
      })
    } catch (error) {
      console.error('Error updating cart:', error)
      throw error
    }
  }

  const removeItem = async (wineVariantId: number) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: wineVariantId })
    } catch (error) {
      console.error('Error removing item:', error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: 'CLEAR_CART' })
      if (!user) {
        localStorage.removeItem('cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }

  const getCartTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      const price =
        typeof item.wineVariant === 'object' && 'details' in item.wineVariant
          ? item.wineVariant.details.price
          : 0
      return total + price * item.quantity
    }, 0)
  }

  const getCartItemCount = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartTotal,
        getCartItemCount,
        hasInitializedCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
