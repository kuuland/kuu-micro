import React from 'react'
import _ from 'lodash'
import { persistEnhancer } from '@/utils/configureStore'
import { config, clearToken, get } from 'kuu-tools'
import { message } from 'antd'
import globalConfig from './config'
import { history as router, getDvaApp } from 'umi'

message.config({ maxCount: 1 })
const kuuToolsConfig = {
  storage: window.localStorage,
  tokenHeaderKey: 'Authorization',
  tokenValuePrefix: 'Bearer ',
  localeContext: React.createContext(),
  messageHandler: (msg, code, json) => (code === 0 ? message.info(msg) : message.error(msg)),
  afterFetch: async (res) => {
    if (res.status === 401) {
      clearToken()
      router.replace(globalConfig.loginPathname)
      throw new Error('登录失效')
    }
  },
  onLogout: url => {
    if (!url.includes('/logout')) {
      clearToken()
      getDvaApp()._store.dispatch({
        type: 'user/logout'
      })
    }
  },
  prefix: globalConfig.prefixUrl + '/api'
}

const gwEndpoint = window.localStorage.getItem('gw_endpoint')
if (gwEndpoint) {
  kuuToolsConfig.prefix = `${gwEndpoint}/gw/api`
}

config(kuuToolsConfig)

function resetEnhancer (next) {
  return (reducer, initialState, enhancer) => {
    const resetType = 'RESET'
    const whitelist = ['router', 'i18n', 'theme']

    const enhanceReducer = (state, action) => {
      if (action.type === resetType) {
        state = { ..._.pick(state, whitelist) }
      }
      return reducer(state, action)
    }

    return next(enhanceReducer, initialState, enhancer)
  }
}

export const dva = {
  config: {
    extraEnhancers: [persistEnhancer, resetEnhancer],
    onError (err) {
      err.preventDefault()
      console.error(err.message)
    }
  }
}

// 从接口中获取子应用配置，export 出的 qiankun 变量是一个 promise
// ${kuuToolsConfig.prefix}/micro/frontends 后台接口, 返回apps和routes
export const qiankun = get('/micro/frontends').then(data => {
  return {
    // 注册子应用信息
    apps: data.apps,
    routes: data.routes,
    // 完整生命周期钩子请看 https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles
    lifeCycles: {
      afterMount: (props) => {
        console.log(props)
      }
    }
    // 支持更多的其他配置，详细看这里 https://qiankun.umijs.org/zh/api/#start-opts
  }
})

// 暴露给子应用的接口
export function useQiankunStateForSlave () {
  return {
    getUser: () => getDvaApp()._store.getState().user.loginData,
    getToken: () => _.get(getDvaApp()._store.getState(), 'user.loginData.Token'),
    getLocaleMessages: () => getDvaApp()._store.getState().i18n.localeMessages,
    getState: (namespace) => _.get(getDvaApp()._store.getState(), namespace)
  }
}
