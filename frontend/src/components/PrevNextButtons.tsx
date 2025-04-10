
import React, { useCallback, useEffect, useState } from 'react';
import { type EmblaCarouselType } from '../types/embla-carousel';
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

type UsePrevNextButtonsType = {
  canScrollPrev: boolean
  canScrollNext: boolean
  onPrevClick: () => void
  onNextClick: () => void
}

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onPrevClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  const onNextClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return {
    canScrollPrev,
    canScrollNext,
    onPrevClick,
    onNextClick
  }
}

type PrevButtonProps = {
  onClick: () => void
  disabled: boolean
  className?: string
}

export const PrevButton: React.FC<PrevButtonProps> = (props) => {
  const { onClick, disabled, className = '' } = props

  return (
    <Button
      variant="outline"
      size="icon"
      className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm z-10 rounded-full shadow-md border-0 ml-1 md:ml-2 w-8 h-8 md:w-10 md:h-10 hover:bg-white hidden md:flex ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
      <span className="sr-only">Previous</span>
    </Button>
  )
}
