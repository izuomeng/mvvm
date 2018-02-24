双向绑定其实就是在单向数据绑定之上增加了数据监听机制，那么如何实现双向绑定呢，其实思路很简单，就是根据数据编译html模版，在编译过程中添加对节点的监听事件，这样就差不多完成了最基本的双向绑定，这里按照vue的实现方法自己写了一个最简单的双向绑定。
## 思路过程
首先看看流程图

![picture](http://120.24.43.150/github/mvvm1.png)

要实现mvvm的双向绑定，就必须要实现以下几点： 
1. 实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知watcher
2. 实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数 
3. 实现一个Watcher，作为连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图 
4. mvvm入口函数，整合以上三者

### observer
要实现监听数据变化有很多种方法，比如defineProperty中的set和get，angular使用的脏检查，我在实现时使用了es6的代理和反射，因为代码非常简洁，但是殊途同归，都是为了在更改对象属性是做到能够引起相应的变化，相关代码如下：
```javascript
proxy(obj, callback = () => {}) {
      handler = {
        get(target, property, receiver) {
          try {
            return new Proxy(target[property], handler)  // 属性也是对象的情况
          } catch (e) {
            return Reflect.get(target, property, receiver)
          } 
        },
        set(target, key, value, receiver) {
          const name = self.getName(key)
          callback(key, target[key], value)  // 执行相应回调
          return Reflect.set(target, key, value, receiver)
        },
        deleteProperty(target, property) {
          callback(property)
          return Reflect.deleteProperty(target, property)
        }
      }
    return new Proxy(obj, handler)
}
```
实现observer的同时还要实现一个Dep函数，该函数的作用是对每一个数据属性创建dep对象，保存该数据对象的所有依赖（视图中含有使用了该数据的节点），依赖是一个watcher对象，含有update方法，dep对象含有notofy方法，在监测到数据变化时会调用该数据对应的dep对象的notify方法，是的dep中的所有watcher执行update方法来更新视图，Dep代码如下
```javascript
class Dep {
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  notify() {
    this.subs.forEach(sub => sub.update())
  }
}
```
Dep还有一个静态的属性target，表示当前的watcher对象，用来连接watcher和observer，初始值为null
### watcher
watcher内包含了update方法，用来执行具体的视图更新操作，在compile编译过程中，如果监测到某个节点使用了数据，那么会为该节点创建watcher对象，update更新时按照模版重新编译该节点即可，这样就做到了只更新依赖数据的节点，不用在数据更改时编译整个html，提高了效率，watcher实现如下
```javascript
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
```
因为observer中get操作会触发添加依赖，这里的get方法就是读取所有依赖的数据，将Dep.target添加到对应的订阅数组中，这样在更新视图时才会更新相应节点，observer中的操作如下
```javascript
...
get(target, property, receiver) {
  try {
    return new Proxy(target[property], handler)
  } catch (e) {
    return Reflect.get(target, property, receiver)
  } finally {
    const name = self.getName(property)  // name标识属性，depsInProp保存了所有的Dep对象
    if (!depsInProp[name]) {
      depsInProp[name] = new Dep()
    }
    if (Dep.target) {
      depsInProp[name].addSub(Dep.target)  // 将watcher添加到sub数组中等待数据更新时使用
    }
  }
}
...
```
### compile
compile功能非常明确，就是初始化视图，绑定事件，如根据胡子语法找到实际的数据并将其替换掉，将v-model的input节点绑定oninput事件达到双向绑定的效果，因此实现很容易看懂，下面是递归编译节点的过程：
```javascript
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
```
这里使用了DocumentFragment来加快编译速度，跟vue的实现一样，首先将根节点的所有子节点遍历移动到fragment中，待执行完编译任务后再填回根节点

### 整合
在执行编译之前还需要一些初始化操作，首先就是observer，将data中的数据遍历一遍添加对象监听，还有很重要的一步就是添加代理，因为想要直接通过访问例如vm.name来拿到name，而不是繁琐的vm.data.name，因此就要在vm上定义一组代理数据，代码如下
```javascript
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
```
最后开始compile就可以了，一个简单的mvvm框架就实现好了，总共不超过300行代码，看看最终效果

![picture](http://120.24.43.150/github/mvvm2.gif)
