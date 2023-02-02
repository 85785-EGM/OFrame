import { toolkit as aframeToolkit } from './aframe'
import { toolkit as vueToolkit } from './vue'

export class Toolkits {
  constructor (...toolkits) {
    this.toolkits = toolkits
  }

  install (app) {
    this.toolkits.map(toolkit => toolkit.install(app))
  }
}

export default new Toolkits(aframeToolkit, vueToolkit)
