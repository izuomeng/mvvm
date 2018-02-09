class Dep {
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    this
      .subs
      .push(sub)
  }
  notify() {
    this
      .subs
      .forEach(sub => sub.update())
  }
}
Dep.target = null

class Observer {
  constructor(obj, callback) {
    return this.proxy(obj, callback)
  }
  proxy(obj, callback = () => {}) {
    const depsInProp = {},
      self = this,
      handler = {
        get(target, property, receiver) {
          try {
            return new Proxy(target[property], handler)
          } catch (e) {
            return Reflect.get(target, property, receiver)
          } finally {
            const name = self.getName(property)
            if (!depsInProp[name]) {
              depsInProp[name] = new Dep()
            }
            if (Dep.target) {
              depsInProp[name].addSub(Dep.target)
            }
          }
        },
        set(target, key, value, receiver) {
          const name = self.getName(key)
          callback(key, target[key], value)
          setTimeout(() => depsInProp[name].notify(), 0)
          // console.log(depsInProp[name])
          return Reflect.set(target, key, value, receiver)
        },
        deleteProperty(target, property) {
          callback(property)
          return Reflect.deleteProperty(target, property)
        }
      }
    return new Proxy(obj, handler)
  }
  getName(...args) {
    return args.reduce((prev, next) => {
      return prev + JSON.stringify(next)
    }, '')
  }
}

export {Observer, Dep}