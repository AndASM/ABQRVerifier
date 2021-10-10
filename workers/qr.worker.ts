import jsQR from 'jsqr-es6'

self.addEventListener('message', onVideoFrame)


function onVideoFrame(event: MessageEvent<ImageData>) {
  if (event?.data && 'data' in event.data && 'height' in event.data) {
    const qrCode = jsQR(event.data.data, event.data.width, event.data.height, {
      inversionAttempts: 'dontInvert'
    })
    if (qrCode)
      self.postMessage(qrCode)
    else
      self.postMessage({empty: true})
  }
}
