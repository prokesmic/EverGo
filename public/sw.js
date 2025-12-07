// Service Worker for Push Notifications and Offline Support

const CACHE_VERSION = 2
const CACHE_NAME = `evergo-v${CACHE_VERSION}`
const STATIC_CACHE = `evergo-static-v${CACHE_VERSION}`
const DYNAMIC_CACHE = `evergo-dynamic-v${CACHE_VERSION}`
const API_CACHE = `evergo-api-v${CACHE_VERSION}`
const IMAGE_CACHE = `evergo-images-v${CACHE_VERSION}`

const OFFLINE_URL = "/offline"

// Core static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/home",
  "/offline",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

// Pages to cache for offline use
const PRECACHE_PAGES = [
  "/leaderboard",
  "/challenges",
  "/profile",
  "/stats",
]

// API endpoints to cache (stale-while-revalidate)
const CACHEABLE_API_ROUTES = [
  "/api/sports",
  "/api/me/stats",
  "/api/leaderboard",
]

// Install - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version", CACHE_VERSION)

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.error("[SW] Failed to cache static assets:", error)
        })
      }),
      // Pre-cache pages in the background
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return Promise.allSettled(
          PRECACHE_PAGES.map(page =>
            fetch(page).then(res => cache.put(page, res)).catch(() => {})
          )
        )
      })
    ])
  )

  self.skipWaiting()
})

// Activate - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating version", CACHE_VERSION)

  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => clients.claim())
  )
})

// Helper: Check if request is an API call
function isApiRequest(url) {
  return url.pathname.startsWith("/api/")
}

// Helper: Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url)
  return request.destination === "image" ||
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)
}

// Helper: Check if request is for a static asset
function isStaticAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.startsWith("/_next/static/")
}

// Fetch - intelligent caching strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Skip cross-origin requests
  if (!url.origin.includes(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Strategy for API requests: Stale-While-Revalidate
  if (isApiRequest(url)) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              // Only cache successful responses
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone())
              }
              return networkResponse
            })
            .catch(() => cachedResponse)

          // Return cached response immediately, update in background
          return cachedResponse || fetchPromise
        })
      })
    )
    return
  }

  // Strategy for images: Cache First with Network Fallback
  if (isImageRequest(event.request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          }).catch(() => {
            // Return a placeholder for failed image loads
            return new Response("", { status: 404 })
          })
        })
      })
    )
    return
  }

  // Strategy for static assets: Cache First
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, networkResponse.clone())
            })
          }
          return networkResponse
        })
      })
    )
    return
  }

  // Strategy for pages: Network First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful page responses
        if (response.ok && event.request.mode === "navigate") {
          const responseToCache = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // If it's a navigation request, return offline page
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL)
          }

          return new Response("Offline", { status: 503 })
        })
      })
  )
})

self.addEventListener("push", (event) => {
  console.log("Push notification received:", event)

  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: "New Notification", body: event.data.text() }
    }
  }

  const title = data.title || "EverGo"
  const options = {
    body: data.body || "You have a new notification",
    icon: data.icon || "/icon-192.png",
    badge: "/badge-72.png",
    image: data.image,
    data: data.url || "/",
    tag: data.tag || "general",
    requireInteraction: false,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)

  event.notification.close()

  const urlToOpen = event.notification.data || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus()
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event)
})
