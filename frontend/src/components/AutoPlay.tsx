
import { type EmblaCarouselType, type EmblaPluginType } from '../types/embla-carousel';

type AutoPlayOptions = {
  delay?: number;
  playOnInit?: boolean;
  stopOnInteraction?: boolean;
  stopOnMouseEnter?: boolean;
};

export const AutoPlay = (
  options: AutoPlayOptions = {}
): EmblaPluginType => {
  const {
    delay = 4000,
    playOnInit = true,
    stopOnInteraction = true,
    stopOnMouseEnter = true
  } = options;

  let timer: ReturnType<typeof setTimeout>;
  let isPlaying = playOnInit;
  
  const autoPlay = (emblaApi: EmblaCarouselType): void => {
    if (!isPlaying) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, delay);
  };

  const stopAutoPlay = (): void => {
    isPlaying = false;
    clearTimeout(timer);
  };

  const startAutoPlay = (): void => {
    isPlaying = true;
  };

  const toggleAutoPlay = (): void => {
    isPlaying ? stopAutoPlay() : startAutoPlay();
  };

  // Define the plugin function with an index signature to satisfy TypeScript
  const plugin = (emblaApi: EmblaCarouselType) => {
    // Set up event listeners
    emblaApi.on('init', () => {
      if (stopOnMouseEnter) {
        const container = emblaApi.rootNode();
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);
      }
    });

    emblaApi.on('destroy', () => {
      clearTimeout(timer);
      if (stopOnMouseEnter) {
        const container = emblaApi.rootNode();
        container.removeEventListener('mouseenter', stopAutoPlay);
        container.removeEventListener('mouseleave', startAutoPlay);
      }
    });

    emblaApi.on('pointerDown', () => {
      if (stopOnInteraction) stopAutoPlay();
    });

    emblaApi.on('settle', () => {
      autoPlay(emblaApi);
    });

    // Start autoplay
    if (playOnInit) {
      startAutoPlay();
      autoPlay(emblaApi);
    }

    // Return plugin API with index signature
    return {
      destroy: () => {
        clearTimeout(timer);
      },
      autoPlay: () => autoPlay(emblaApi),
      stopAutoPlay,
      startAutoPlay,
      toggleAutoPlay,
      // Add index signature for any additional properties
      [Symbol.toPrimitive]: () => 'EmblaCarouselAutoPlayPlugin'
    };
  };

  return plugin as EmblaPluginType;
};
