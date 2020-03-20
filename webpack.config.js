const path = require('path');
// 자동적으로 webpack-dev-server나 webpack에서 소스폴더에 있는 index.html같은 파일을 자동으로 배포폴더 밑에 생성하고 거기에 번들링된 script태그를 추가 시킨다.
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js'
  },
  // mode: 'development' package.json에서 적용할 것임.
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}
