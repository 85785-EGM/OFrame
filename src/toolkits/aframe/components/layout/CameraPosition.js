export default {
  dependencies: ['camera'],
  schema: {
    default: '0 0 0',
    parse (value) {
      console.log(value)
      if (typeof value === 'string') {
        return value.split(' ').map(f => parseFloat(f))
      } else {
        return value
      }
    }
  },

  update () {
    const position = this.data
    console.log(this)
  }
}
