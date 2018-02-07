export function getData(str, obj = {}) {
  if (str === undefined) {
    return
  }
  if (str.indexOf('.') > -1) {
    return str.split('.').reduce((left, right) => {
      if (left[right]) {
        return left[right]
      }
    }, obj)
  }
  return obj[str]
}

export function setData(key, value, obj = {}) {
  if (key === undefined) {
    return
  }
  if (key.indexOf('.') > -1) {
    key = key.split('.')
    key.reduce((left, right) => {
      if (right === key[key.length - 1]) {
        left[right] = value
      } else {
        return left[right]
      }
    }, obj)
  } else {
    obj[key] = value
  }
}