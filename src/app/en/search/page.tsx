import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from './page.client'

export default async function Page() {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center mt-8">
      <PageClient />
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Search',
}
