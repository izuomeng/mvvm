import observe from './lib/observer'

class MVVM {
  constructor(options) {
    this._data = observe(options.data)
    
  }
}