import { CloudOff } from 'lucide-react'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus()

  if (!isOffline) return null

  return (
    <div className="flex items-center  gap-2.5 px-6 py-4 text-sm font-medium bg-amber-50 border-b border-amber-200 text-amber-700 animate-[slideDown_0.25s_ease_both]">
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
      <CloudOff size={15} className="shrink-0 animate-pulse" />
      <span>
        <strong>Offline mode</strong> — Records save locally and sync when you reconnect.
      </span>
    </div>
  )
}