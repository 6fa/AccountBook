# 一个用原生js + webpack4 + IndexedDB 写的记账本

## 项目介绍
一个用原生js、打包工具webpack、浏览器数据库IndexedDB写的移动端记账本。主要功能如下：
  - 明细页面：按日期切换显示某年某月账单明细，显示这个月总收入总支出，点击条目可查看详情、删除条目。
  - 记账页面：可切换到支出/收入类目、切换日期，点击类别图标即弹出记账弹窗。<br>
              设置按钮可以增加/删除类别。
  - 账单页面： 切换年份显示某年总收入、支出、结余，以及每月的收入、支出、结余，点击条目可以查看某月支出/收入排行榜。

主要封装了路由（可切换history模式以及hash模式）、滚动型日期选择器、数据库操作。

ps: 如果有写的不对之处、还可以改进的地方，希望大家能够指出，感激不尽~




## 效果图
[效果图可戳此链接查看](https://6fa.github.io/#accountBook)

## 目录结构
  - screenshot: 项目效果图片
  - src
    - assets
      - fonts：字体
      - config.js: 设置路由模式、初始记账类型
    - components
      - navBar: 底部导航栏组件
      - timePicker: 时间选择器组件
    - router：路由
    - utils
      - database.js: 数据库操作
      - event.js: 发布/订阅事件
      - store.js: localStorage的操作
    - views
      - bill: 账单页面
      - home: 首页（明细）
      - record：记账页面
      - setting：类型设置页面
    - index.css
    - index.html: 入口html
    - index.js：入口js
  - .babelrc/.eslintrc.js/package.json/postcss.config.js: 项目配置相关
  - webpack.common.js: 生产环境和开发环境中的相同webpack配置
  - webpack.dev.js: 生产环境webpack配置
  - webpack.prod.js: 开发环境webpack配置



## 运行
  ```
  # 安装依赖
  npm install

  # 使用webpack-dev-server运行：
  npm run dev

  # 打包为生产环境
  npm run build
  ```



## webpack配置解释

### webpack.common.js

```javascript
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      // 处理html文件
      {
        test: /\.html$/,
        use: [
          'html-loader'
        ]
      },
      // 处理字体文件
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },

  plugins: [
    // CleanWebpackPlugin插件：在webpack打包前删除output.path中的内容
    new CleanWebpackPlugin(),

    // HtmlWebpackPlugin插件：生成html5入口文件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],

  // 代码优化
  optimization: {
    usedExports: true,
    // 代码分割
    splitChunks: {
      chunks: 'all', // 对同步和异步引用的模块都进行分割
      minSize: 30000, // 引入的模块大于30kb才进行分割
      maxSize: 0,
      minChunks: 1, // 模块至少被使用的次数
      maxAsyncRequests: 5, // 需要分割的模块超出这个数目后将不再分割
      maxInitialRequests: 3,
      automaticNameDelimiter: '~', //缓存组与文件名之间的连接符
      name: true,
      cacheGroups: { // 缓存组，将符合条件的模块一起分割打包
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          filename: 'vendors.js'
        },
        default: {
          minChunks: 2, // 重复引用两次以及以上
          priority: -20,
          reuseExistingChunk: true, // 复用其他chunk内已拥有的模块
          filename: 'common.js'
        }
      }
    }
  }
}

```
其他：<br>
optimization.usedExports:true 表示查看哪些导出模块被使用了，再进行打包。<br>
还需在package.json中添加：
`"sideEffects": ["*.css"],`
表示对除了css文件的所有未使用模块进行tree shaking(移除上下文中未引用代码)

### webpack.dev.js

```javascript
// merge用于合并webpack.js
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common')
const path = require('path')

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    overlay: true,
    contentBase: path.resolve(__dirname, 'dist'),
    host: '192.168.3.5',

    // 解决单页面应用路由问题，使得任意错误页面都返回index.html
    historyApiFallback: true
  },
  module: {
    rules: [
      // 处理css文件,从下往上依次执行：postcss-loader自动加厂商前缀
      // css-loader分析各个css文件之间的依赖关系并合并成一个文件
      // style-loader会把这段css内容挂到页面的head部分
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      // 对js文件进行代码检测、语法转换
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'eslint-loader',
            options: {
              fix: true
            }
          }
        ]
      }
    ]
  }
}

module.exports = merge(commonConfig, devConfig)

```


### webpack.prod.js

```javascript
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common')

const prodConfig = {
  mode: 'production',
  // 压缩css资源
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  // 提取css文件
  plugins: [new MiniCssExtractPlugin(
    {
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    }
  )],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      }
    ]
  }
}

module.exports = merge(commonConfig, prodConfig)


```

## 路由系统
  在router文件夹里有：<br>
  - base.js
  - hash.js
  - history.js
  - router.js
  - routerList.js
  ### base.js
  base.js包含初始化路由(init)、渲染页面(render)两个函数，是hash及history模式都用到的，故提取到base，导出为BaseRouter。<br>
  init函数确定选择的模式及路由列表；render函数接收传入的路径，执行该路径对应的component函数，component函数的作用是动态引入页面，使用了es6的import()方法
  ```javascript
    const BaseRouter = {
    init: function (options) {
      this.mode = options.mode ? options.mode : 'hash'
      this.pathList = options.pathList ? options.pathList : []
    },
    render: function (state) {
      let p = state
      // 如果有通过路由传递参数
      if (state.includes('?')) {
        p = p.split('?')[0]
      }
      // 从pathList中找到对应路由
      const path = this.pathList.find((path) => {
        return (path.path === p)
      })
      path.component()
    }
  }

  export default BaseRouter

  ```

  ### routerList.js
  前面说到了路径对应的component函数，那就先来看一下放置路由信息的列表：
  ```javascript
  
  const routerList = [
    {
      path: '/',
      component: () => {
        import('../views/home/home').then(({ default: fn }) => {
          fn()
        })
      }
    }
    // ......
  ]

  export default routerList

  ```
  执行component时，动态加载页面组件并且返回一个promise。由于我的页面组件直接export default了一个函数（包含页面的所有逻辑，包括将页面插入到指定的div），执行fn()即开始渲染页面、监听页面交互动作等。





  ### hash.js
  实现hash模式主要是监听hashchange，其压入、替换、前进后退功能通过改变window.location.hash而触发hashchange，从而进行页面渲染。<br>

  注意hashRouter.renderView里this.render是BaseRouter里的render，因为hashRouter是通过Object.create(BaseRouter)形成的，则hashRouter的__proto__就为BaseRouter，这样就形成了它们之间的[[Prototype]]链，render函数通过原型链查找得到。<br>

  hash模式的前进、后退功能的实现要借助自己保存的路由历史列表，因为浏览器不允许开发者直接读取浏览记录。自己保存的记录还需要储存在sessionStorage中，这样刷新页面也依然存在，关闭页面则清掉记录。

  ```javascript
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
      // 路由历史列表长度控制
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
    // ...
  }

  // 替换功能
  hashRouter.replaceRouter = function (myurl) {
    // ...
  }

  // 前进 后退功能
  hashRouter.goRouter = function (n) {
    // ...
  }

  export default hashRouter

  ```

  ### history.js
  history模式相对更简单，通过History的API我们可以直接操作浏览器路由记录(如window.history.go()、window.history.back()等)。通过window.hitory.pushState()新增一条记录、window.history.replaceState()替换一条记录。<br>

  浏览器路由历史改变会触发popstate, 通过监听popstate可以进行需要的操作。需要注意的是pushSate()、replaceState()不会触发popstate，故要手动去执行所需操作。<br>

  另外需要注意的是historyRouter的各个函数名称应该与hashRouter的保持一致，这样不论是哪个模式，在router.js里都可以原型链引用这个名称的函数。
  
  ```javascript
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
  export default historyRouter

  ```
  
  ### router.js
  router.js里，将Router初始化, 并且挂载到window上，方便在各个页面组件中使用。

  ```javascript
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

  Router.start()
  window.$router = Router

  ```


## 时间选择器组件
  ### Intersection Observer
  时间选择器组件的实现主要是采用了Intersection Observer，利用它可以很方便地监测到目标元素与祖先元素的交集变化，如检测到目标元素进入/离开祖先元素。

  本例中创建了两个Intersection Observer，一个用于监听时间列表的首尾是否进入视区(祖先元素)，接着进行相应时间列表更新操作；另一个observer用于选择用户选中的时间元素。大致示意图如下：
  
  ![schematic diagram](/screenshot/observer.png)

  里面的item即一个个包含时间文本的节点元素，item列表是一个可以滚动的列表（这里把item的父容器高度设置为一个item的高度，css中设置overflow属性为scroll，注意这里的父容器不是obersver，而是被observer包含了）。oberver监听的是每一个item，通过属性isIntersecting判断是否进入了区域内。

  ps：由于Intersection Observer的浏览器兼容性不是很好，可以使用它的polyfill版本
  
  ### 实现无限滚动
  选择器可以选择只出现年或月或日（日不能单独存在），其中年份是上下无限加载的（但是列表长度始终不变），月份和日期内容相对固定（日期随着年、月更改），是无限滚动模式。

  实现无限滚动的关键点在于监测最后一个和第一个（或者根据列表高度/observer高度确定）出现在视区（observer1），手动滚动列表使其达到“合适的位置”，使得视区（observer1）外部永远存在其他元素充当第一个/最后一个。<br>
  为了制造合适的位置，比如月份列表，不仅仅需要1-12月这12个元素，而是另外重复一份1-12，即24个元素。而且应该在一开始取得元素的高度，确定observer1的高度（即要显示多少个item）和observer2的高度（observer2的高度应和item高度一致）<br>
  如下图：

  ![schematic diagram](/screenshot/month.png)

  确定高度后，n是多少是可以很容易知道的。为了确保任何一个元素充当上图的target时，视区外仍有其他元素，重复一份列表就排上用场了。

  举个例子，想要target为2，那么就不能直接让月份数组中的第2个出现在observer2，因为这样就看到你列表的尽头了。而是让第14个元素（12+2）出现在observer2中。

  总结起来就是如果是n区域中的元素，应该使用数组后部分的元素。当上图中的“1”出现在observer1时，将列表滚动到数组后部分的元素“1”，从而实现无限滚动。日期同理，只是根据年份和月份改变元素个数。

  ### 实现无限加载
  年份上拉为无限减少，下拉为无限增加，列表长度不变，通过重复渲染实现。无限滚动部分和上面一样的方法，只是最后没有将列表滚动位置，而是重新渲染再滚动到合适位置。

  如无限下拉的实现：一组30个年份的元素列表，当第30-n个元素出现在observer1的底部时（此时，出现在observer2的元素为target），就应该重新渲染列表。并且该新列表中第n+1个元素就为target，将target滚动到observer2位置。

  ### 优点/缺陷
  与通过传统的对滚动事件的监听、获取滚动距离来实现无限滚动相比，Intersection Observer方法显得更简洁一些，并且不需要做防抖逻辑。<br>
  当然这种方式也需要计算, 主要是需要拟定好元素的位置
