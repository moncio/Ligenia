
import * as React from "react"

// Definimos diferentes breakpoints para una mayor flexibilidad
export const BREAKPOINTS = {
  MOBILE: 640,  // sm
  TABLET: 768,  // md
  DESKTOP: 1024 // lg
}

// Hook para detectar si es un dispositivo móvil
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE)
    }
    
    // Check immediately
    checkMobile()
    
    // Add event listener for resize
    window.addEventListener("resize", checkMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Hook para detectar si es una tablet
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.DESKTOP)
    }
    
    checkTablet()
    window.addEventListener("resize", checkTablet)
    
    return () => window.removeEventListener("resize", checkTablet)
  }, [])

  return isTablet
}

// Hook para detectar si es un desktop
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.DESKTOP)
    }
    
    checkDesktop()
    window.addEventListener("resize", checkDesktop)
    
    return () => window.removeEventListener("resize", checkDesktop)
  }, [])

  return isDesktop
}
