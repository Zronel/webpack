'use strict'
var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var helper = require('./helper')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin-multihtml')
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

// inject happypack accelerate packing for vue-loader
Object.assign(vueLoaderConfig.loaders, {
  js: 'happypack/loader?id=happy-babel-vue'
})

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

{{#multihtml}}
var entrys = helper.getEntrys('./src/app')
{{/multihtml}}
var baseConf = {
  context: path.resolve(__dirname, '../'),
  entry: {
    {{#multihtml}}
    app: entrys
    {{else}}
    app: './src/main.js'
    {{/multihtml}}
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      {{#if_eq build "standalone"}}
      'vue$': 'vue/dist/vue.esm.js',
      {{/if_eq}}
      'src': resolve('src'),
      'assets': resolve('src/assets'),
      'components': resolve('src/components'),
      'conf': resolve('src/conf')
    }
  },
  module: {
    rules: [
      {{#lint}}
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {{/lint}}
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'happypack/loader?id=happy-babel-js',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 2500,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  {{#multihtml}}
  plugins: [
    new webpack
      .optimize
      .CommonsChunkPlugin({
        name: 'vendor',
        chunks: Object.keys(entrys),
        minChunks: function (module, count) {
          // any required modules inside node_modules are extracted to vendor
          return (module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0 && count > 8)
        }
      }),
    // happypack plugins
    helper.createHappyPlugin('happy-babel-js', ['babel-loader?cacheDirectory=true']),
    helper.createHappyPlugin('happy-babel-vue', ['babel-loader?cacheDirectory=true']),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack
      .optimize
      .CommonsChunkPlugin({name: 'manifest', chunks: ['vendor']}),
    new LodashModuleReplacementPlugin({
    'collections': true,
    'paths': true
    })
  ],
  {{/multihtml}}
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}

module.exports = baseConf