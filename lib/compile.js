// 利用data中的数据编译html，将胡子语法替换为相应数据
class Compile {
  constructor(mvvm, el) {
    this.root = document.querySelector(el) || document.body
    this.mvvm = mvvm
    this.compile()
  }
  compile() {
    const fragment = Compile.node2Fragment(this.root),
      children = Array.from(fragment.childNodes)
    // operation to fragment...
    this.root.appendChild(fragment)
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