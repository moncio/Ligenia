
import type { 
  EmblaCarouselType as OriginalEmblaCarouselType, 
  EmblaOptionsType as OriginalEmblaOptionsType, 
  EmblaPluginType as OriginalEmblaPluginType, 
  EmblaEventType 
} from 'embla-carousel'

// Re-export the original types
export type { EmblaEventType }
export type EmblaCarouselType = OriginalEmblaCarouselType
export type EmblaOptionsType = OriginalEmblaOptionsType

// Define a more flexible plugin type to ensure compatibility
export interface EmblaPluginType {
  (emblaApi: EmblaCarouselType): {
    destroy?: () => void;
    [key: string]: any;
  };
}

// Additional type for the hook
export type UseEmblaCarouselType = [
  (node: HTMLElement | null) => void,
  EmblaCarouselType | undefined
]
