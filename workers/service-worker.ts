const sw = self as ServiceWorkerGlobalScope & typeof globalThis

export namespace _Service {
  export const version = `${GIT_VERSION}: ${GIT_AUTHOR_DATE}`
  export const cacheNames = {install: `install ${GIT_VERSION}`}
  export const knownUrls = [
    '404.html',
    '404.js',
    '404.css'
  ]
  
  export function init() {
    console.log(`Initializing service worker ${version}`)
    
    sw.addEventListener('install', eventOnInstall)
    sw.addEventListener('activate', eventOnActivate)
    sw.addEventListener('fetch', eventOnFetch)
  }
  
  function eventOnInstall(ev: ExtendableEvent) {
    ev.waitUntil(waitInstall())
    console.log('eventInstall')
  }
  
  function eventOnActivate(ev: ExtendableEvent) {
    ev.waitUntil(waitActivate())
    console.log('eventActivate')
  }
  
  function cacheKeys() {
    return Object.values(cacheNames)
  }
  
  async function waitInstall() {
    console.log(`Install Event`)
    const cache = await caches.open(cacheNames.install)
    console.log(`Opened cache "${cacheNames.install}"`)
    await cache.addAll(knownUrls)
    console.log(`Added ${knownUrls.length} items`)
    await sw.skipWaiting()
  }
  
  async function waitActivate() {
    console.log(`Activate Event`)
    const currentCaches = await caches.keys()
    const oldCaches = currentCaches.filter(cacheName => !cacheKeys().includes(cacheName))
    console.log(`To remove: ["${oldCaches.join('", "')}"] from: ["${currentCaches.join('", "')}"]`)
    
    await Promise.all(oldCaches.map(expiredCache => {
      return caches.delete(expiredCache)
    }))
    console.log('Caches removed')
    await sw.clients.claim()
    console.log('Clients claimed')
    
    const windows = await sw.clients.matchAll({type: 'window'})
    for (const window of windows) {
      if ('navigate' in window)
        window.navigate(sw.location.href.replace(/\/[^\/]+?\.[^\/]+?$/, '/')).then()
    }
  }
  
  function eventOnFetch(event: FetchEvent) {
    const url = new URL(event.request.url, sw.location.href)
    
    if (url.protocol.startsWith('http') && url.origin === self.location.origin) {
      event.respondWith(fetchLocal(event))
    }
  }
  
  async function fetchLocal(event: FetchEvent) {
    const cachedResponse = await caches.match(event.request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    const url = new URL(event.request.url, sw.location.href)
    console.log(`Attempted to fetch missing: ${url.toString()}`)
    
    return await caches.match(new Request('404.html'))
  }
}

(self as any).CachingSW = _Service
_Service.init()

declare const GIT_VERSION: string
declare const GIT_AUTHOR_DATE: string
