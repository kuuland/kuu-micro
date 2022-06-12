// ref: https://umijs.org/config/
export default {
  hash: true,
  targets: {
    ie: 11
  },
  mfsu: {
    production: {}
  },
  antd: {},
  dva: {
    hmr: true,
    immer: false,
  },
  title: 'kuu micro',
  locale: {
    default: 'en-US',
    baseNavigator: true,
    antd: true
  },
  dynamicImport: {},
  qiankun: {
    master: {
      apps: []
    }
  },
  proxy: {
    '/gw/api': {
      target: 'http://127.0.0.1:3000/',
      changeOrigin: true,
    },
    '/assets': {
      target: 'http://127.0.0.1:3000//',
      changeOrigin: true
    }
  },
  theme: {
    '@primary-color': '#4E74FF',
  }
}
