import type {QRCode} from 'jsqr-es6'
import {CanvasVideoDrawing, Rectangular} from './drawing'
import {issuerNames} from './SmartHealthCard/knownissuers'
import {SmartHealthCard} from './SmartHealthCard/smarthealthcards'

interface AppElements {
  video: HTMLVideoElement,
  videoPlaceholder: HTMLElement,
  canvas: HTMLCanvasElement,
  output: HTMLElement,
  startupMessage: HTMLElement,
  loadingMessage: HTMLElement,
  subtitle: HTMLElement
}

function isObject(thing: any) {
  return typeof thing === 'object' && !Array.isArray(thing) && thing !== null
}

export default class App {
  el: AppElements
  video: CanvasVideoDrawing
  lastQrData: string
  _tickAvailable: boolean
  location: Rectangular
  locationCountdown: number
  qrWorker: Worker
  scanLine: number
  scanDir: boolean
  scanSpeed: number
  
  constructor() {
    this.initElements()
    this.scanLine = 0
    this.scanSpeed = 4
    this.scanDir = true
    this._tickAvailable = true
    this.lastQrData = ''
    this.location = null
    this.qrWorker = new Worker('./qr.worker.js')
    this.qrWorker.addEventListener('message', event => this.onMessage(event))
    
    const regions = Object.getOwnPropertyNames(issuerNames)
    this.el.subtitle.innerText = `With experimental support for ${regions.slice(0,-1).join(', ')}, and ${regions.slice(-1)} proof-of-vaccine QR codes`
  }
  
  async onMessage(event: MessageEvent) {
    this._tickAvailable = true
    if (typeof event.data === 'string')
      console.log(event.data)
    if (isObject(event?.data) && 'location' in event.data && 'data' in event.data)
      await this.onQrCode(event.data)
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
      this.video.onVideoFrame.subscribe(this.onVideoFrame.bind(this))
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
  
  protected onVideoFrame(canvas: CanvasVideoDrawing, imageData: ImageData) {
    if (this._tickAvailable) {
      this._tickAvailable = false
      this.qrWorker.postMessage(imageData)
      this.moveScanLine()
    }
  }
  
  protected moveScanLine() {
    this.scanLine += this.scanDir ? this.scanSpeed : -this.scanSpeed
    if (this.scanLine <= 0)
      this.scanDir = true
    if (this.scanLine >= this.el.canvas.height)
      this.scanDir = false
  }
  
  protected drawRect() {
    if (this.locationCountdown > 0) {
      this.video.drawRectangular(this.location, '#3B58FF')
      this.locationCountdown--
    }
    else {
      this.video.drawLine({x: 0, y: this.scanLine}, {x: this.el.canvas.width, y: this.scanLine}, '#FF3B58')
    }
  }
  
  protected async onQrCode(qrCode: QRCode) {
    this.location = qrCode.location
    this.locationCountdown = 30
    
    // This is just to prevent spam
    if (this.lastQrData !== qrCode.data) {
      this.lastQrData = qrCode.data
      
      SmartHealthCard.build(qrCode.data).then(shc => this.addEntry(shc))
    }
  }
  
  protected initElements() {
    this.el = {
      canvas: <HTMLCanvasElement>document.getElementById('canvas'),
      loadingMessage: document.getElementById('loadingMessage'),
      output: document.getElementById('output'),
      startupMessage: document.getElementById('startupMessage'),
      video: <HTMLVideoElement>document.createElement('video'),
      videoPlaceholder: document.getElementById('videoPlaceholder'),
      subtitle: document.getElementById('subtitle')
    }
  }
  
}
