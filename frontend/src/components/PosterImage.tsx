import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type PosterImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
}

export function PosterImage({
  src,
  alt,
  className,
  fallbackClassName
}: PosterImageProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-zinc-900 px-4 text-center text-sm text-zinc-400',
          fallbackClassName
        )}
      >
        Affiche indisponible
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}
