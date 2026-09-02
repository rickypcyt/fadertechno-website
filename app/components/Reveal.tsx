import type { ReactNode } from 'react'

type Direction = 'left' | 'right' | 'up' | 'down' | 'scale' | 'fade'

interface RevealProps {
  children: ReactNode
  from?: Direction
  delay?: number
  duration?: number
  repeat?: boolean
  as?: string
  className?: string
  style?: React.CSSProperties
}

export function Reveal({
  children,
  className,
  style,
  ...rest
}: RevealProps) {
  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  )
}

export default Reveal
