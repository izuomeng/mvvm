function parse(str) {
  const names = str.match(/\[(\w+)\]/g).map(v => v.slice(1, -1)),
    start = str.match(/^(\w+)\[/)[1]
  names.unshift(start)
  return names
}
function getKeys(keys = [], obj) {
  return keys.reduce((left, right) => {
    if (left) {
      return left[right]
    }
  }, obj)
}
function setKeys(keys = [], value, obj) {
  keys.reduce((left, right) => {
    if (right === keys[keys.length - 1]) {
      left[right] = value
    } else {
      return left[right]
    }
  }, obj)
}
export function getData(str, obj = {}) {
  let result
  if (str === undefined) {
    return
  }
  if (str.indexOf('.') > -1) {
    return getKeys(str.split('.'), obj)
  } else if (str.indexOf('[') > -1 && str.indexOf(']') > -1) {
    return getKeys(parse(str), obj)
  }
  return result
}

export function setData(key, value, obj = {}) {
  if (key === undefined) {
    return
  }
  if (key.indexOf('.') > -1) {
    const keys = key.split('.')
    setKeys(keys, value, obj)
  } else if (key.indexOf('[') > -1 && key.indexOf(']') > -1) {
    setKeys(parse(key), value, obj)
  } else {
    obj[key] = value
  }
}