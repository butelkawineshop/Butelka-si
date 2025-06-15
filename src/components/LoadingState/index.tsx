'use client'

interface Props {
  className?: string
  children?: React.ReactNode
}

export function LoadingState({ className, children }: Props) {
  return (
    <div className={`flex min-h-[50vh] w-full flex-col gap-8 sm:p-8 ${className || ''}`}>
      {/* Hero Section Skeleton */}
      <div className="relative flex min-h-[50vh] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-primary/5 to-primary/10 p-8 text-center backdrop-blur-sm">
        <div className="h-12 w-3/4 animate-pulse rounded-lg bg-primary/20" />
      </div>

      {/* Media Section Skeleton */}
      <div className="w-full">
        <div className="h-64 w-full animate-pulse rounded-2xl bg-primary/20" />
      </div>

      {/* Content Section Skeleton */}
      <div className="mt-12">
        <div className="mb-6 h-8 w-1/3 animate-pulse rounded-lg bg-primary/20" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-primary/20" />
          ))}
        </div>
      </div>

      {children}
    </div>
  )
}
