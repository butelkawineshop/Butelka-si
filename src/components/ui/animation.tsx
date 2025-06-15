import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utilities/ui'
import * as React from 'react'

// Animation variants
export const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideInOut = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
}

export const scaleInOut = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}

export const slideUpInOut = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const slideDownInOut = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// Animation transitions
export const transitions = {
  default: { duration: 0.2 },
  spring: { type: 'spring' as const, damping: 25, stiffness: 300 },
  smooth: { duration: 0.3, ease: 'easeInOut' as const },
}

// Reusable animation components
interface AnimatedProps {
  children: React.ReactNode
  show?: boolean
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export const FadeInOut: React.FC<AnimatedProps> = ({
  children,
  show = true,
  className,
  onClick,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        variants={fadeInOut}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.default}
        className={cn(className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

export const SlideInOut: React.FC<AnimatedProps> = ({
  children,
  show = true,
  className,
  onClick,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        variants={slideInOut}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.spring}
        className={cn(className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

export const ScaleInOut: React.FC<AnimatedProps> = ({
  children,
  show = true,
  className,
  onClick,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        variants={scaleInOut}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.spring}
        className={cn(className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

export const SlideUpInOut: React.FC<AnimatedProps> = ({
  children,
  show = true,
  className,
  onClick,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        variants={slideUpInOut}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.smooth}
        className={cn(className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

export const SlideDownInOut: React.FC<AnimatedProps> = ({
  children,
  show = true,
  className,
  onClick,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        variants={slideDownInOut}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.smooth}
        className={cn(className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

// Button animation variants
export const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

// Reusable animated button component
interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  onClick,
  type = 'button',
  disabled = false,
}) => (
  <motion.button
    whileHover="hover"
    whileTap="tap"
    variants={buttonVariants}
    className={cn(className)}
    onClick={onClick}
    type={type}
    disabled={disabled}
  >
    {children}
  </motion.button>
)
