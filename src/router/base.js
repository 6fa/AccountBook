const BaseRouter = {
  init: function (options) {
    this.mode = options.mode ? options.mode : 'hash'
    this.pathList = options.pathList ? options.pathList : []
  },
  render: function (state) {
    let p = state
    if (state.includes('?')) {
      p = p.split('?')[0]
    }
    // 用于提示navBar切换icon状态
    const path = this.pathList.find((path) => {
      return (path.path === p)
    })
    path.component()
  }
}

export default BaseRouter
