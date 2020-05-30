export default {
  setItem: function (name, val) {
    const valStr = JSON.stringify(val)
    localStorage.setItem(name, valStr)
  },
  getItem: function (name) {
    const res = localStorage.getItem(name)
    if (res) {
      return JSON.parse(res)
    }
  },
  delItem: function (name) {
    localStorage.removeItem(name)
  }
}
