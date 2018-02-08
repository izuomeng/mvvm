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
    // update view
    this.node.textContent = this.node.template.replace(/\{\{(.*?)\}\}/g, this.value)
  }
  get() {
    this.value = getData(this.name, this.vm)
  }
}

export default Watcher