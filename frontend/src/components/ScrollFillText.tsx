import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ScrollFillTextProps {
  text: string
  className?: string
  grayClassName?: string
  whiteClassName?: string
}

export function ScrollFillText({
  text,
  className = '',
  grayClassName = 'text-zinc-700',
  whiteClassName = 'text-zinc-200'
}: ScrollFillTextProps) {
  const [progress, setProgress] = useState<number>(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const startPoint = windowHeight * 0.85
      const endPoint = windowHeight * 0.25

      if (rect.top >= startPoint) {
        setProgress(0)
      } else if (rect.top <= endPoint) {
        setProgress(1)
      } else {
        const scrollProgress = (startPoint - rect.top) / (startPoint - endPoint)
        setProgress(Math.min(1, Math.max(0, scrollProgress)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const visibleLength = Math.floor(text.length * progress)
  const revealedText = text.slice(0, visibleLength)
  const hiddenText = text.slice(visibleLength)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <span className={whiteClassName}>{revealedText}</span>
      <span className={grayClassName}>{hiddenText}</span>
    </div>
  )
}

export interface ScrollFillContainerProps {
  children: ReactNode
  className?: string
}

export function ScrollFillContainer({
  children,
  className = ''
}: ScrollFillContainerProps) {
  const [progress, setProgress] = useState<number>(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const startPoint = windowHeight * 0.85
      const endPoint = windowHeight * 0.25

      if (rect.top >= startPoint) {
        setProgress(0)
      } else if (rect.top <= endPoint) {
        setProgress(1)
      } else {
        const scrollProgress = (startPoint - rect.top) / (startPoint - endPoint)
        setProgress(Math.min(1, Math.max(0, scrollProgress)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const style = { ['--scroll-progress']: progress } as unknown as CSSProperties

  return (
    <div ref={ref} className={cn('relative', className)} style={style}>
      {children}
    </div>
  )
}
