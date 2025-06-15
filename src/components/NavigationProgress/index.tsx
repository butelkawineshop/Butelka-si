'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

export const NavigationProgress: React.FC = () => {
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    // Reset scroll position on route change
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
      style={{ scaleX }}
    />
  )
}
