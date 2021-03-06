import { get } from 'kuu-tools'
import qs from 'qs'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import { history as router, getDvaApp } from 'umi'
import config from '@/config'
import { isWhiteRoute } from '@/utils/tools'

export default {
  state: {
    menus: undefined,
    menusTree: undefined,
    activeMenuIndex: 0,
    activePane: undefined,
    openKeys: [],
    panes: []
  },
  reducers: {
    SET_MENUS (state, { payload: menus }) {
      const menusTree = arrayToTree(_.cloneDeep(menus), {
        customID: 'Code',
        parentProperty: 'ParentCode',
        childrenProperty: 'Children'
      })
      let { activeMenuIndex, openKeys } = state
      if (activeMenuIndex < 0 || activeMenuIndex >= menusTree.length) {
        activeMenuIndex = 0
      }
      if (_.isEmpty(openKeys)) {
        openKeys = _.get(menusTree, `[${activeMenuIndex}].Children`, []).map(item => `${item.ID}`)
      }
      return { ...state, menus, menusTree, openKeys, activeMenuIndex }
    },
    SET_PANES (state, { payload: panes }) {
      panes = panes.filter(pane => !!pane)
      const newState = { panes }
      if (_.isEmpty(panes)) {
        newState.activeMenuIndex = 0
        newState.activePane = undefined
      }
      return { ...state, ...newState }
    },
    SET_ACTIVE_MENU_INDEX (state, { payload: activeMenuIndex }) {
      return { ...state, activeMenuIndex }
    },
    SET_OPEN_KEYS (state, { payload: openKeys }) {
      return { ...state, openKeys }
    },
    SET_ACTIVE_PANE (state, { payload }) {
      const { activePane, openKeys, panes } = payload
      if (activePane) {
        delete activePane.Content
      }
      if (_.isEmpty(openKeys)) {
        return { ...state, activePane, panes }
      }
      return { ...state, activePane, openKeys, panes }
    }
  },
  effects: {
    * loadMenus ({ payload }, { put, call }) {
      const data = yield call(get, '/user/menus')
      let menus = Array.isArray(data) ? data : []
      const needOpenMenus = _.cloneDeep(menus).filter(item => !!item.IsDefaultOpen)
      const firstPane = _.get(needOpenMenus, '[0]')
      menus = _.chain(menus)
        .filter(item => {
          if (item.Disable === false) {
            return false
          }
          return item.IsVirtual !== true
        })
        .map(item => {
          if (!item.Group) {
            item.Group = null
          }
          return item
        })
        .sortBy('Sort').value()
      yield put({ type: 'SET_MENUS', payload: menus })
      if (firstPane) {
        yield put({ type: 'openPane', payload: firstPane })
      }
    },
    * openPane ({ payload: value }, { put, select }) {
      const state = yield select(state => state.layout)
      const { menus, activePane: currentActivePane } = state
      const panes = state.panes.filter(pane => !!pane)
      let openKeys = state.openKeys
      let activePane = panes.find(p => `${p.ID}` === `${value.ID}`)

      if (!activePane) {
        activePane = value
        const currentIndex = _.findIndex(panes, p => `${p.ID}` === `${currentActivePane.ID}`)
        if (currentIndex > 0 && (currentIndex + 1) < panes.length) {
          panes.splice(currentIndex + 1, 0, value)
        } else {
          panes.push(value)
        }
      }
      if (_.size(panes) === 0) {
        const newOpenKeys = calcOpenKeys(activePane, menus)
        if (!_.isEmpty(newOpenKeys)) {
          openKeys = newOpenKeys
        }
      }
      // ??????????????????
      yield put({ type: 'SET_ACTIVE_PANE', payload: { activePane, openKeys, panes } })
      // ????????????
      const pathname = value.IsLink ? `/sys/iframe/${value.ID}` : value.URI
      const data = _.omit(value, 'Content')
      const routeData = parseMenuURI(pathname)
      routeData.state = data
      routeData.query = _.merge(routeData.query, _.get(value, 'query'))
      yield router.push(routeData)
    },
    * delPane ({ payload: targetKey }, { put, select }) {
      const state = yield select(state => state.layout)
      const { panes } = state
      const index = panes.findIndex(p => `${p.ID}` === targetKey)
      if (index >= 0) {
        let activePane = _.get(panes, `[${index - 1}]`) || _.get(panes, `[${index + 1}]`) || _.get(panes, '[0]') || null
        panes.splice(index, 1)
        if (_.includes(panes, state.activePane)) {
          activePane = state.activePane
        }
        yield put({ type: 'SET_PANES', payload: panes })
        if (panes.length > 0) {
          yield put({ type: 'openPane', payload: activePane })
        } else {
          yield put({ type: 'SET_ACTIVE_PANE', payload: { activePane: undefined, openKeys: [], panes } })
        }
      }
    }
  },
  subscriptions: {
    setup (ctx) {
      const { dispatch, history } = ctx
      const state = getDvaApp()._store.getState()
      // ???????????????
      if (_.isEmpty(_.get(state, 'i18n.localeMessages'))) {
        dispatch({
          type: 'i18n/getIntlMessages'
        })
      }
      const listener = route => {
        if (route.pathname !== config.loginPathname && !isWhiteRoute(route.pathname)) {
          const { layout, user, enums } = getDvaApp()._store.getState()
          // if (window.localStorage.getItem('logout')) {
          //   return
          // }
          // ????????????
          if (!user.loginData) {
            dispatch({ type: 'user/valid' })
          }
          // ????????????
          if (!layout.menus) {
            dispatch({ type: 'loadMenus' })
            dispatch({ type: 'theme/loadTheme' })
          }
          // ????????????
          if (_.isEmpty(enums.enumMap)) {
            dispatch({ type: 'enums/loadAllEnums' })
          }
        }
      }
      history.listen(listener)
    }
  }
}

function calcOpenKeys (activePane, menus) {
  if (!activePane) {
    return
  }
  const openKeys = []
  const menusMap = _.chain(menus, 'ID').groupBy('ID').mapValues(v => _.head(v)).value()
  const pick = (menu, menusMap, openKeys) => {
    if (!menu) {
      return
    }
    if (menusMap[menu.ID]) {
      openKeys.push(`${menu.ID}`)
    }
    if (menu.ParentCode) {
      pick(menusMap[menu.ParentCode], menusMap, openKeys)
    }
  }
  pick(activePane, menusMap, openKeys)
  return openKeys
}

function parseMenuURI (uri) {
  const indexOf = uri.indexOf('?')
  if (indexOf < 0) {
    return { pathname: uri }
  }
  const pathname = uri.substring(0, indexOf)
  const query = qs.parse(uri.substring(indexOf + 1))
  return { pathname, query }
}
