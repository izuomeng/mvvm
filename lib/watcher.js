import { Dep } from './observer'
import { getData } from './utils'

class Watcher {
  constructor(vm, node, name) {
    Dep.target = this
    this.vm = vm
    this.node = node
    this.name = name
    this.get()
    Dep.target = null
  }
  update() {
    this.get()
    this.node.textContent = this.value
  }
  get() {
    this.value = getData(this.name, this.vm)
  }
}

export default Watcher