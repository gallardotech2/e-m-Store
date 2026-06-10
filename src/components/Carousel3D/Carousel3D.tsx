'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { Carousel3DProps } from './types'
import './Carousel3D.css'

export default function Carousel3D({
  images,
  autoPlay = true,
  interval = 3500,
  loop = true,
  showArrows = true,
  showBullets = true,
  emptyMessage = 'No hay imagenes para mostrar.',
  className = '',
  onSlideChange,
}: Carousel3DProps) {
  const [current, setCurrent] = useState(0)
  const total = images.length
  const viewportRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchDeltaX = useRef(0)
  const isSwiping = useRef(false)
  const isVerticalScroll = useRef(false)

  const goTo = useCallback((index: number) => {
    setCurrent(index)
  }, [])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total)
  }, [total])

  useEffect(() => {
    onSlideChange?.(current)
  }, [current, onSlideChange])

  useEffect(() => {
    if (!autoPlay || total <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, next, total])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchDeltaX.current = 0
      isSwiping.current = true
      isVerticalScroll.current = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return

      const deltaX = e.touches[0].clientX - touchStartX.current
      const deltaY = e.touches[0].clientY - touchStartY.current

      if (!isVerticalScroll.current && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        isVerticalScroll.current = true
        isSwiping.current = false
        return
      }

      if (Math.abs(deltaX) > 10 && !isVerticalScroll.current) {
        e.preventDefault()
      }

      touchDeltaX.current = deltaX
    }

    const onTouchEnd = () => {
      if (!isSwiping.current) return
      isSwiping.current = false
      const threshold = 50

      if (touchDeltaX.current > threshold) {
        prev()
      } else if (touchDeltaX.current < -threshold) {
        next()
      }
      touchDeltaX.current = 0
    }

    viewport.addEventListener('touchstart', onTouchStart, { passive: true })
    viewport.addEventListener('touchmove', onTouchMove, { passive: false })
    viewport.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart)
      viewport.removeEventListener('touchmove', onTouchMove)
      viewport.removeEventListener('touchend', onTouchEnd)
    }
  }, [next, prev])

  const getPosition = (index: number): string => {
    const diff = (index - current + total) % total
    if (diff === 0) return 'center'
    if (diff === 1) return 'right-1'
    if (diff === total - 1) return 'left-1'
    if (diff === 2) return 'right-2'
    if (diff === total - 2) return 'left-2'
    return 'hidden'
  }

  if (total === 0) {
    return (
      <div className={`carousel3d carousel3d--empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`carousel3d ${className}`}>
      {showArrows && (
        <>
          <button className="carousel3d__arrow carousel3d__arrow--left" onClick={prev} aria-label="Anterior">
            &#10094;
          </button>
          <button className="carousel3d__arrow carousel3d__arrow--right" onClick={next} aria-label="Siguiente">
            &#10095;
          </button>
        </>
      )}

      <div ref={viewportRef} className="carousel3d__viewport">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel3d__slide carousel3d__slide--${getPosition(index)}`}
            onClick={() => loop ? goTo(index) : undefined}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="580px"
              draggable={false}
              className="pointer-events-none"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {showBullets && (
        <div className="carousel3d__bullets">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel3d__bullet ${index === current ? 'carousel3d__bullet--active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
