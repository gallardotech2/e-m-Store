export interface CarouselImage {
  src: string
  alt: string
}

export interface Carousel3DProps {
  images: CarouselImage[]
  autoPlay?: boolean
  interval?: number
  loop?: boolean
  showArrows?: boolean
  showBullets?: boolean
  emptyMessage?: string
  className?: string
  onSlideChange?: (index: number) => void
}
