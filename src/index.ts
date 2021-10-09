import App from './App'
import './styles/index.scss'
import '../CNAME'

async function main() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err)
    })
  }
  
  (window as any).application = new App()
  await (window as any).application.run()
}

window.addEventListener('load', main)
