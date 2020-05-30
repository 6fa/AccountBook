import BaseRouter from './base'

const historyRouter = Object.create(BaseRouter)

historyRouter.initRouter = function (options) {
  this.init(options)

  window.addEventListener('popstate', () => {
    this.renderView()
  })

  this.renderView()
}

historyRouter.renderView = function () {
  let state = window.location.pathname
  if (!state) {
    state = '/'
  }
  // 用于提示navBar切换icon状态
  window.$myEvent.emit('historyChange')
  this.render(state)
}

// 压入功能
historyRouter.pushRouter = function (path) {
  window.history.pushState(null, null, path)
  // PushState不会触发popstate事件 要手动触发
  this.renderView()
}

// 替换
historyRouter.replaceRouter = function (path) {
  window.history.replaceState(null, null, path)
  this.renderView()
}

// 后退
historyRouter.goRouter = function (n) {
  window.history.go(n)
}

// 获取当前页面路径
historyRouter.getRouterPath = function () {
  return window.location.pathname
}

export default historyRouter
