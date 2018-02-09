import Watcher from './watcher'
import { getData, setData } from './utils'

class Compile {
  constructor(mvvm, el) {
    this.root = document.querySelector(el) || document.body
    this.mvvm = mvvm
    this.start()
  }
  start() {
    const fragment = Compile.node2Fragment(this.root)
    // operations to fragment...
    Array.from(fragment.childNodes).forEach(node => this.compile(node))
    this.root.appendChild(fragment)
  }
  compile(node) {
    const reg = /\{\{(.*?)\}\}/g
    if (Compile.isTextNode(node)) {
      // replace {{ data }} to data
      let data, deps = new Set()
      const text = node.textContent
      node.template = text
      node.textContent = text.replace(reg, (result, $1) => {
        data = $1.trim()
        deps.add(data)
        return getData(data, this.mvvm)
      })
      new Watcher(this.mvvm, node, deps)
    } else if (node.tagName === 'INPUT') {
      const attrs = node.attributes;
      Array.from(attrs).forEach(attr => {
        if (attr.nodeName === 'v-model') {
          const name = attr.nodeValue.trim()
          node.value = getData(name, this.mvvm)
          node.addEventListener('input', e => setData(name, e.target.value, this.mvvm))
          node.removeAttribute('v-model')
        }
      })
    } else if (Compile.isElementNode(node) && node.firstChild) {
      Array.prototype.forEach.call(node.childNodes, node => this.compile(node))
    }
  }
  static node2Fragment(el) {
    let fragment = document.createDocumentFragment()
    while (el.firstChild) {
      fragment.appendChild(el.firstChild)
    }
    return fragment
  }
  static isTextNode(node) {
    return node && node.nodeType === 3
  }
  static isElementNode(node) {
    return node && node.nodeType === 1
  }
}

export default Compile