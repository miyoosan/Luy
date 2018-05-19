'use strict'

//用于甚至环境变量
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

//如果崩溃了，我们在这里抛出错误，省得出错了也不知道
process.on('unhandledRejection', err => {
  throw err
})

const fs = require('fs')
const chalk = require('chalk') //颜色模块
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { choosePort, createCompiler, prepareProxy, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')

const openBrowser = require('react-dev-utils/openBrowser')
const paths = require('../config/paths')
const config = require('../config/webpack.config.dev')
// const config = require('../config/webpack.anu.config');
const createDevServerConfig = require('../config/webpackDevServer.config')

const useYarn = fs.existsSync(paths.yarnLockFile)
const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1)
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return
    }
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const appName = require(paths.appPackageJson).name
    const urls = prepareUrls(protocol, HOST, port)
    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler(webpack, config, appName, urls, useYarn)
    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic)
    // Serve webpack assets generated by the compiler over a web sever.
    const serverConfig = createDevServerConfig(proxyConfig, urls.lanUrlForConfig)
    const devServer = new WebpackDevServer(compiler, serverConfig)
    // Launch WebpackDevServer.
    devServer.listen(port, HOST, err => {
      if (err) {
        return console.log(err)
      }
      if (isInteractive) {
        clearConsole()
      }
      console.log(chalk.cyan('Starting the development server...\n'))
      openBrowser(urls.localUrlForBrowser)
    })
    ;['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close()
        process.exit()
      })
    })
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
