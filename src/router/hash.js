import BaseRouter from './base'

const hashRouter = Object.create(BaseRouter)

hashRouter.initRouter = function (options) {
  this.init(options)
  this.previousPath = ''
  this.currentPath = window.location.hash ? window.location.hash.slice(1) : '/'
  // 路由历史
  const getHistory = sessionStorage.getItem('history')
  const getTempHistory = sessionStorage.getItem('temHistory') // 用于储存截取的history元素
  this.history = getHistory ? getHistory.split(',') : []
  this.temHistory = getTempHistory ? getTempHistory.split(',') : []

  // 监听hash变化
  window.addEventListener('hashchange', () => {
    this.renderView()
    if (this.history.length > 10) {
      this.history = this.history.slice(-10)
    }
    sessionStorage.setItem('history', this.history)
  })

  this.renderView()
}

hashRouter.renderView = function () {
  // 获取hash
  let state = window.location.hash
  state = state ? state.slice(1) : '/'
  this.render(state)
}

// 压入功能
hashRouter.pushRouter = function (url) {
  let path = url
  if (url.indexOf('?') !== -1) {
    path = url.split('?')[0]
  }
  if (this.previousPath !== this.currentPath) {
    this.previousPath = this.currentPath
    this.currentPath = path
    this.history.push(this.previousPath)
  }
  window.location.hash = url

  console.log(this.previousPath, this.currentPath)
  console.log(this.history)
}

// 替换功能
hashRouter.replaceRouter = function (myurl) {
  let path = myurl
  if (myurl.indexOf('?') !== -1) {
    path = myurl.split('?')[0]
  }
  const url = window.location.href
  const index = url.indexOf('#')
  const baseUrl = index > -1 ? url.slice(0, index) : url
  window.location.replace(`${baseUrl}#${myurl}`)
  this.currentPath = path
  const ind = this.history.length - 1 < 0 ? 0 : this.history.length - 1
  this.history[ind] = this.currentPath

  console.log(this.previousPath, this.currentPath)
  console.log(this.history)
}

// 前进 后退功能
hashRouter.goRouter = function (n) {
  if (this.history.length < 1) return
  const length = this.history.length
  let hash
  if (n < 0 && Math.abs(n) <= length) { // 后退
    if (!this.history[length - Math.abs(n)]) {
      hash = this.history[0]
    } else {
      hash = this.history[length - Math.abs(n)]
    }

    this.previousPath = this.history[length - Math.abs(n) - 1]
    this.currentPath = hash
    const items = this.history.slice(0, length - Math.abs(n))
    const sliceItems = this.history.slice(length - Math.abs(n))
    this.history = items
    this.temHistory = sliceItems
  } else if (n > 0 && n <= this.temHistory.length) { // 前进
    hash = this.temHistory[n - 1]
    this.previousPath = this.history[length]
    this.currentPath = hash
    this.history = this.history.push(hash)
    this.temHistory = this.temHistory.filter(item => item !== hash)
  } else if (n === 0) { // 刷新
    this.renderView()
    return
  }

  window.location.hash = hash
}

// 获取当前页面路径
hashRouter.getRouterPath = function () {
  return this.currentPath
}

export default hashRouter
