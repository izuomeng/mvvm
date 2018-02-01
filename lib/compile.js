class Compile {
  constructor(mvvm, el) {
    this.el = document.querySelector(el) || document.body
    this.root = this.el.cloneNode(true)
    this.mvvm = mvvm
    this.start()
  }
  start() {
    const fragment = Compile.node2Fragment(this.root),
    children = Array.from(fragment.childNodes)
    // operations to fragment...
    children.forEach(node => this.compile(node))
    this.el.innerHTML = ''
    this.el.appendChild(fragment)
  }
  compile(node) {
    if (Compile.isTextNode(node)) {
      // replace {{ data }} to data
      const text = node.textContent
      node.textContent = text.replace(/\{\{(.*?)\}\}/g, (result, $1) => {
        const data = $1.trim()
        return this.mvvm[data]
      })
    } else if (Compile.isElementNode(node) && node.firstChild) {
      Array.prototype.forEach.call(node.childNodes, node => this.compile(node))
    }
  }
  static node2Fragment(el) {
    let fragment = document.createDocumentFragment()
    Array.prototype.forEach.call(el.children, (node) => {
      const fake = node.cloneNode(true)
      fragment.appendChild(fake)
    })
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