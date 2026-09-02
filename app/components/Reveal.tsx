'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type Direction = 'left' | 'right' | 'up' | 'down' | 'scale' | 'fade'

const OFFSET = 40

function initialFor(direction: Direction) {
  switch (direction) {
    case 'left':
      return { x: -OFFSET, opacity: 0 }
    case 'right':
      return { x: OFFSET, opacity: 0 }
    case 'up':
      return { y: OFFSET, opacity: 0 }
    case 'down':
      return { y: -OFFSET, opacity: 0 }
    case 'scale':
      return { scale: 0.96, opacity: 0 }
    case 'fade':
    default:
      return { opacity: 0 }
  }
}

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  from?: Direction
  delay?: number
  duration?: number
  /** Si true, anima cada vez que entra en viewport; por defecto solo la primera vez. */
  repeat?: boolean
  as?: keyof typeof motion
}

export function Reveal({
  children,
  from = 'fade',
  delay = 0,
  duration = 0.6,
  repeat = false,
  className,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion()
  const initial = reduce ? { opacity: 0 } : initialFor(from)

  return (
    <motion.div
      initial={initial}
      whileInView={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      viewport={{ once: !repeat, margin: '0px 0px -40px 0px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
