import MVVM from './lib/mvvm'

const vm = new MVVM({
  el: '#root',
  data: {
    person: {
      name: {
        first: 'Tom',
        last: 'Smith'
      },
      age: 15
    }
  }
})