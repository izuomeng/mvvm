import { Observer, Dep } from './observer'
import Compile from './compile'

class MVVM {
  constructor(options) {
    this._data = new Observer(options.data, this.update.bind(this))
    // act for properties in _data, let mvvm.age equals mvvm._data.age
    this.addProxy()
    // compile html
    this.compile = new Compile(this, options.el)
  }
  update(a,b,c) {
    console.log(a,b,c)
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