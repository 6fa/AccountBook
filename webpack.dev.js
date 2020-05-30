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
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
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
