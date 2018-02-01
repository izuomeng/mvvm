import Observe from './observer'
import Compile from './compile'

class MVVM {
  constructor(options) {
    this._data = Observe(options.data, this.update.bind(this))
    this.addProxy()
    this.compile = new Compile(this, options.el)
  }
  update() {
    this.compile.start()
  }
  addProxy() {
    for (let attr in this._data) {
      Object.defineProperty(this, attr, {
        configurable:false,
        enumerable: true,
        get() {
          return this._data[attr]
        },
        set(value) {
          this._data[attr] = value
        }
      })
    }
  }
}

export default MVVM