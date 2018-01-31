function proxy(obj, callback) {
  const handler = {
    get(target, property, receiver) {
      try {
        return new Proxy(target[property], handler)
      } catch (e) {
        return Reflect.get(target, property, receiver)
      }
    },
    set(target, key, value, receiver) {
      callback(key, target[key], value)
      return Reflect.set(target, key, value, receiver)
    },
    deleteProperty(target, property) {
      callback(property)
      return Reflect.deleteProperty(target, property)
    }
  }
  return new Proxy(obj, handler)
}

export default proxy