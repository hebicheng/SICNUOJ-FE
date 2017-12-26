const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const config = require('../config')
const utils = require('./utils')

const NODE_ENV = utils.getNodeEnv()

const vendors = [
  'vue/dist/vue.esm.js',
  'vue-router',
  'vuex',
  'axios',
  'moment',
  'codemirror/lib/codemirror.js',
  'codemirror/mode/clike/clike.js',
  'codemirror/mode/python/python.js',
];

module.exports = {
  entry: {
    "vendor": vendors,
  },
  output: {
    path: path.join(__dirname, '../static/js'),
    filename: '[name].dll.[hash:7].js',
    library: '[name]_[hash]_dll',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': NODE_ENV === 'production' ? config.build.env : config.dev.env
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
    new UglifyJSPlugin({
      exclude: /\.min\.js$/,
      cache: true,
      parallel: true
    }),
    new webpack.DllPlugin({
      context: __dirname,
      path: path.join(__dirname, '[name]-manifest.json'),
      name: '[name]_[hash]_dll',
    })
  ]
};
