import * as components from './components'
import * as directives from './directives'

class Toolkit {
  constructor ({ components = {}, directives = {} }) {
    this.components = components
    this.directives = directives
  }

  parse (key) {
    return key
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-+/g, '')
  }

  install (app) {
    Object.entries(this.components).map(([key, component]) => {
      app.component(this.parse(key), component)
      console.debug('Vue component registered:', this.parse(key))
    })
    Object.entries(this.directives).map(([key, directive]) => {
      app.directive(this.parse(key), directive)
      console.debug('Vue directive registered:', this.parse(key))
    })
  }
}

export const toolkit = new Toolkit({ components, directives })
