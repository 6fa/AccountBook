import 'intersection-observer/intersection-observer.js'
import './assets/fonts/iconfont.css'
import './index.css'

import './utils/event'
import './router/router'
import './components/navBar/index'

import dataBase from './utils/database'
dataBase.initDB('accountBook', 1, 'accounts', {
  index: ['time', 'type'],
  indexUnique: false
})

// 页面加载完毕时
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    // 防止有些安卓机软键盘弹出时，将页面压缩
    document.body.style.height = document.body.clientHeight + 'px'
  }
}
