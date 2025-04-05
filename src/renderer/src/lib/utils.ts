import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function useNavigationLock(cooldownMs = 300) {
  const [isNavigating, setIsNavigating] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Reset navigation lock when location changes
  useEffect(() => {
    setIsNavigating(false)
  }, [location.pathname])

  // Safe navigation function with built-in lock
  const safeNavigate = (to) => {
    if (isNavigating || to === location.pathname) {
      console.log('Navigation prevented - already navigating or same route')
      return
    }

    setIsNavigating(true)
    navigate(to)

    // Extra safety - reset lock after timeout
    setTimeout(() => {
      setIsNavigating(false)
      console.log('Navigation lock released after timeout')
    }, cooldownMs)
  }

  return { isNavigating, safeNavigate }
}
