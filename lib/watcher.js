import {Dep} from './observer'
import {getData} from './utils'

class Watcher {
  constructor(vm, node, name) {
    Dep.target = this
    this.value = []
    this.vm = vm
    this.node = node
    this.name = name
    this.get()
    Dep.target = null
  }
  update() {
    // update view
    this.node.textContent = this
      .node
      .template
      .replace(/\{\{(.*?)\}\}/g, (result, $1) => getData($1.trim(), this.vm))
  }
  get() {
    if (this.name) {
      this.name.forEach(v => {
        this.value.push(getData(v, this.vm))
      })
    }
  }
}

export default Watcher