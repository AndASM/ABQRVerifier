import jsQR from 'jsqr'
import {CanvasVideoDrawing, Rectangular} from './drawing'
import {SmartHealthCard} from './SmartHealthCard/smarthealthcards'

interface AppElements {
  video: HTMLVideoElement,
  videoPlaceholder: HTMLElement,
  canvas: HTMLCanvasElement,
  output: HTMLElement,
  startupMessage: HTMLElement,
  loadingMessage: HTMLElement
}


export default class App {
  el: AppElements
  video: CanvasVideoDrawing
  lastQrData: string
  _tickAvailable: boolean
  location: Rectangular
  locationCountdown: number
  
  constructor() {
    this.initElements()
    this._tickAvailable = true
    this.lastQrData = ''
    this.location = null
  }
  
  async run() {
    // Use facingMode: environment to attempt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}}).then(value => this.setVideoStream(value))
  }
  
  async setVideoStream(stream: MediaStream) {
    const video = this.el.video
    const el = this.el
    el.loadingMessage.hidden = false
    el.startupMessage.hidden = true
    video.srcObject = stream
    video.setAttribute('playsinline', 'true') // required to tell iOS safari we don't want fullscreen
    video.play().then(() => {
      el.loadingMessage.hidden = true
      el.canvas.hidden = false
      el.videoPlaceholder.hidden = true
      el.output.hidden = false
      this.video = new CanvasVideoDrawing(el.canvas, video)
      this.video.onVideoFrame.subscribe((sender, args) => this.tickDropper(sender, args))
      this.video.onVideoFrame.subscribe(() => this.drawRect())
    })
  }
  
  addEntry(shc: SmartHealthCard) {
    const output = this.el.output
    const container = document.createElement('div')
    container.className =
        `person ${shc.verified ? 'verified' : 'invalid'} ${
            shc.immunizationPercentage === 100 ? 'complete' : 'incomplete'
        }`
    
    container.innerHTML = `
        <div class="patientName">${shc.patient.fullName}</div>
        <div class="immunizationLevel">${shc.immunizationPercentage.toString(10)}</div>
    `
    
    output.appendChild(container)
    output.insertBefore(container, output.firstChild)
    
    if (output.childElementCount >= 10) {
      output.lastElementChild.remove()
    }
  }
  
  protected async tickDropper(canvas: CanvasVideoDrawing, imageData: ImageData) {
    if (this._tickAvailable) {
      this._tickAvailable = false
      await this.tick(canvas, imageData)
      this._tickAvailable = true
    }
  }
  
  protected drawRect() {
    if (this.locationCountdown > 0) {
      this.video.drawRectangular(this.location, '#FF3B58')
      this.locationCountdown--
    }
  }
  
  protected async tick(canvas: CanvasVideoDrawing, imageData: ImageData) {
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    })
    
    if (qrCode) {
      this.location = qrCode.location
      this.locationCountdown = 30
      
      // This is just to prevent spam
      if (this.lastQrData !== qrCode.data) {
        this.lastQrData = qrCode.data
        
        SmartHealthCard.build(qrCode.data).then(shc => this.addEntry(shc))
      }
    }
  }
  
  protected initElements() {
    this.el = {
      canvas: <HTMLCanvasElement>document.getElementById('canvas'),
      loadingMessage: document.getElementById('loadingMessage'),
      output: document.getElementById('output'),
      startupMessage: document.getElementById('startupMessage'),
      video: <HTMLVideoElement>document.createElement('video'),
      videoPlaceholder: document.getElementById('videoPlaceholder')
    }
  }
  
}
