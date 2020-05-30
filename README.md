# 一个用原生js + webpack + IndexedDB 写的记账本

## 项目介绍
一个用原生js、打包工具webpack、浏览器数据库IndexedDB写的移动端记账本。主要功能如下：
  - 明细页面：按日期切换显示某年某月账单明细，显示这个月总收入总支出，点击条目可查看详情、删除条目。
  - 记账页面：可切换到支出/收入类目、切换日期，点击类别图标即弹出记账弹窗。<br>
              设置按钮可以增加/删除类别。
  - 账单页面： 切换年份显示某年总收入、支出、结余，以及每月的收入、支出、结余，点击条目可以查看某月支出/收入排行榜。

主要封装了路由（可切换history模式以及hash模式）、滚动型日期选择器、数据库操作。

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


## 效果图
 - 首页
  ![home](/screenshot/home.png)
 - 首页详情
  ![home-detail](/screenshot/home-detail.png)
 - 记账页
  ![record](/screenshot/record.png)
 - 设置
  ![setting](/screenshot/setting.png)
 - 账单
  ![bill](/screenshot/bill.png)
 - 账单排行
  ![bill-rank](/screenshot/bill-rank.png)

## 运行
  ```
  # 安装依赖
  npm install

  # 使用webpack-dev-server运行： http://192.168.3.5:8080/ 
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

## 时间选择器组件

  