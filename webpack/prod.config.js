const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    options: path.join(__dirname, '../chrome/extension/options'),
    meatWagon: path.join(__dirname, '../chrome/extension/meatWagon'),
    popup: path.join(__dirname, '../chrome/extension/popup'),
    background: path.join(__dirname, '../chrome/extension/background'),
    inject: path.join(__dirname, '../chrome/extension/inject')
  },
  output: {
    path: path.join(__dirname, '../build/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
    new webpack.optimize.DedupePlugin(),
    /*
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compressor: {
        warnings: false
      }
    }),
    */
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      exclude: /(s-alert-default.css|s-alert-css-effects|normalize.css)/,
      loaders: [
        'style',
        'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
        'postcss'
      ]
    }, {
      test: /\.css$/,
      include: /(s-alert-default.css|s-alert-css-effects|normalize.css)/,
      loader: 'style-loader!css-loader?sourceMap'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  }
}
