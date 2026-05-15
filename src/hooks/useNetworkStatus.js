import { useState, useEffect } from 'react'

// useNetworkStatus — a custom React hook that tracks whether the device is online or offline
// A custom hook is just a function that uses React's built-in hooks (useState, useEffect)
// and returns useful data. By extracting this logic here, every screen can just call
// useNetworkStatus() without duplicating the event listener code.

export function useNetworkStatus() {
  // navigator.onLine is the browser's built-in property — true = online, false = offline
  // We initialize state with the current value so the first render is already correct
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // These browser events fire whenever the network connects or disconnects
    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Add listeners when the component mounts
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup: remove listeners when the component unmounts (prevents memory leaks)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, []) // empty dependency array = run only once on mount

  return { isOnline, isOffline: !isOnline }
}
