'use client'

import { useEffect, useRef, useState } from 'react'

// Add Google Maps types
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: {
            new (
              input: HTMLInputElement,
              options?: { types?: string[] },
            ): {
              addListener: (event: string, callback: () => void) => void
              getPlace: () => PlaceDetails
            }
          }
          PlacesService: {
            new (attributionNode: HTMLElement): {
              getDetails: (
                request: { placeId: string },
                callback: (place: PlaceDetails | null, status: string) => void,
              ) => void
            }
          }
        }
      }
    }
  }
}

interface AddressResult {
  formatted_address: string
  locality: string
  postal_code: string
  country: string
  street_number: string
  route: string
}

interface AddressComponent {
  longText: string
  types: string[]
}

interface PlaceDetails {
  formattedAddress: string
  addressComponents: AddressComponent[]
  types: string[]
}

interface Suggestion {
  placePrediction: {
    text: {
      text: string
    }
    placeId: string
  }
}

interface AddressSearchProps {
  value: string
  onChange: (address: AddressResult) => void
  required?: boolean
  placeholder?: string
  id?: string
  name?: string
  className?: string
}

export const AddressSearch = ({
  value,
  onChange,
  required = false,
  placeholder = 'Enter your address',
  id,
  name,
  className = '',
}: AddressSearchProps) => {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (input: string) => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          'X-Goog-FieldMask':
            'suggestions.placePrediction.text,suggestions.placePrediction.placeId',
        },
        body: JSON.stringify({
          input,
          includedRegionCodes: ['si'], // Restrict to Slovenia
          languageCode: 'sl', // Slovenian language
        }),
      })

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    fetchSuggestions(newValue)
  }

  const handleSuggestionClick = async (placeId: string) => {
    try {
      const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          'X-Goog-FieldMask': 'formattedAddress,addressComponents,types',
        },
      })

      const place = (await response.json()) as PlaceDetails

      const addressResult: AddressResult = {
        formatted_address: place.formattedAddress || '',
        locality: '',
        postal_code: '',
        country: '',
        street_number: '',
        route: '',
      }

      // Extract address components
      place.addressComponents?.forEach((component: AddressComponent) => {
        const types = component.types || []
        if (types.includes('street_number')) {
          addressResult.street_number = component.longText
        } else if (types.includes('route')) {
          addressResult.route = component.longText
        } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          // Extract just the city name without postal code
          const cityName = component.longText.replace(/^\d+\s+/, '') // Remove postal code if present
          addressResult.locality = cityName
        } else if (types.includes('postal_code')) {
          addressResult.postal_code = component.longText
        } else if (types.includes('country')) {
          addressResult.country = component.longText
        }
      })

      // If locality is still empty, try to extract it from the formatted address
      if (!addressResult.locality && place.formattedAddress) {
        const parts = place.formattedAddress.split(',')
        if (parts.length >= 2 && parts[1]) {
          // The city is usually the second part of the address
          const cityPart = parts[1].trim()
          // Remove postal code if present
          addressResult.locality = cityPart.replace(/^\d+\s+/, '')
        }
      }

      // Construct address1 from street number and route
      if (addressResult.street_number || addressResult.route) {
        addressResult.formatted_address =
          `${addressResult.street_number} ${addressResult.route}`.trim()
      }

      console.log('Address result:', addressResult) // Debug log
      onChange(addressResult)
      setInputValue(addressResult.formatted_address)
      setSuggestions([])
    } catch (error) {
      console.error('Error fetching place details:', error)
    }
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        id={id}
        name={name}
        className={`w-full px-3 py-2 border rounded-md ${className}`}
        autoComplete="off"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                suggestion.placePrediction?.placeId &&
                handleSuggestionClick(suggestion.placePrediction.placeId)
              }
            >
              {suggestion.placePrediction?.text?.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
