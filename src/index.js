/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */
const path = require('path')

const extendWithComponent = (conf) => {
  // make sure boot file is registered
  conf.boot.push('~quasar-app-extension-auth-token-based/src/boot/index.js')

  // make sure boot file transpiles
  conf.build.transpileDependencies.push(/quasar-app-extension-auth-token-based[\\/]src/)

  const requiredPlugins = ['Notify', 'Dialog', 'Cookies']

  requiredPlugins.forEach(plugin => {
    if (!conf.framework.plugins.includes(plugin)) {
      conf.framework.plugins.push(plugin)
    }
  })

  conf.preFetch = true

  console.log('App Extension (auth-token-based) Info: \'Adding auth-token-based boot reference to your quasar.conf.js\'')
}

const chainWebpack = (ctx, chain) => {
  chain.resolve.alias
    .set('auth-token-based', path.resolve(__dirname, './components'))
}

module.exports = function (api) {
  api.compatibleWith('@quasar/app', '^1.0.0')

  // register JSON api
  // api.registerDescribeApi('QPostalCode', './components/QPostalCode.json')
  api.chainWebpack((chain) => chainWebpack(api.ctx, chain))

  // extend quasar.conf
  api.extendQuasarConf(extendWithComponent)
}
