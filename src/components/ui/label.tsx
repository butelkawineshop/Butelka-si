'use client'

import { cn } from '@/utilities/ui'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

const Label: React.FC<
  { ref?: React.Ref<HTMLLabelElement> } & React.ComponentProps<typeof LabelPrimitive.Root>
> = ({ className, ref, ...props }) => (
  <LabelPrimitive.Root 
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )} 
    ref={ref} 
    {...props} 
  />
)

export { Label }
