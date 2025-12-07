import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client (for realtime subscriptions)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Database table names (for realtime subscriptions)
export const TABLES = {
  POSTS: 'Post',
  ACTIVITIES: 'Activity',
  COMMENTS: 'Comment',
  LIKES: 'Like',
  NOTIFICATIONS: 'Notification',
  FOLLOWS: 'Follow',
} as const

// Realtime channel types
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

// Helper to subscribe to table changes
export function subscribeToTable<T>(
  table: string,
  callback: (payload: { new: T; old: T; eventType: RealtimeEvent }) => void,
  filter?: string
) {
  if (!supabase) {
    console.warn('Supabase not configured, realtime disabled')
    return null
  }

  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      (payload) => {
        callback({
          new: payload.new as T,
          old: payload.old as T,
          eventType: payload.eventType as RealtimeEvent,
        })
      }
    )
    .subscribe()

  return channel
}
