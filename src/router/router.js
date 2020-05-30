import hashRouter from './hash'
import historyRouter from './history'
import routerList from './routerList'
import Config from '../assets/config'

const mode = Config.mode

const Router = mode === 'hash' ? Object.create(hashRouter) : Object.create(historyRouter)
const options = {
  mode: mode,
  pathList: routerList
}

Router.start = function () {
  this.initRouter(options)
}
Router.push = function (path) {
  this.pushRouter(path)
}
Router.replace = function (path) {
  this.replaceRouter(path)
}
Router.go = function (n) {
  this.goRouter(n)
}
Router.getPath = function () {
  return this.getRouterPath()
}

Router.start()
window.$router = Router
