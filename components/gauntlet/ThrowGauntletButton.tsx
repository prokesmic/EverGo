'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Swords, X } from 'lucide-react'
import { GauntletDuration } from '@prisma/client'

interface ThrowGauntletButtonProps {
  opponentId: string
  opponentName: string
  className?: string
  onSuccess?: () => void
}

const durations: { value: GauntletDuration; label: string; description: string }[] = [
  { value: 'ONE_DAY', label: '24 Hours', description: 'Quick sprint challenge' },
  { value: 'THREE_DAYS', label: '3 Days', description: 'Standard challenge' },
  { value: 'ONE_WEEK', label: '1 Week', description: 'Extended battle' },
]

export function ThrowGauntletButton({
  opponentId,
  opponentName,
  className,
  onSuccess,
}: ThrowGauntletButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [duration, setDuration] = useState<GauntletDuration>('THREE_DAYS')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gauntlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opponentId,
          duration,
          message: message.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create gauntlet')
      }

      setIsOpen(false)
      setMessage('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
          "font-medium text-sm hover:from-violet-700 hover:to-purple-700",
          "transition-all shadow-md hover:shadow-lg",
          className
        )}
      >
        <Swords className="w-4 h-4" />
        Throw the Gauntlet
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Throw the Gauntlet</h2>
                    <p className="text-sm text-white/80">Challenge {opponentName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Challenge Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-center transition-all",
                        duration === d.value
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <span className="block font-semibold text-sm text-slate-900">
                        {d.label}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        {d.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Challenge Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add some trash talk..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {message.length}/200
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">
                  Once {opponentName} accepts, you'll both compete to accumulate the most Power during the challenge period. May the best athlete win!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
