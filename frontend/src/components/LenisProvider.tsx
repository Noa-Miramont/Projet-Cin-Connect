import { useEffect } from 'react'
import Lenis from 'lenis'

type Props = {
  children: React.ReactNode
}

export function LenisProvider({ children }: Props) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.5
    })

    let rafId = 0

    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
