import _ from 'lodash'
import config from '@/config'
import moment from 'moment'

/**
 * 是否白名单路由
 * @param pathname
 * @returns {boolean}
 */
export function isWhiteRoute (pathname) {
  const whiteRoutes = _.get(config, 'whiteRoutes', [])
  const name = _.filter(whiteRoutes, item => pathname === item)
  return _.size(name) > 0
}

function authCheck (target, type) {
  const dataIndex = { permission: 'Permissions', role: 'RolesCode' }[type]
  const total = _.result(window, `g_app._store.getState.user.loginData.${dataIndex}`)

  if (_.isString(target)) {
    target = target.trim()
    if (_.includes(target, '|')) {
      for (const item of target.split('|')) {
        if (_.includes(total, item)) {
          return true
        }
      }
      return false
    } else {
      target = target.split(',')
    }
  }

  if (!_.isArray(target)) {
    return false
  }
  const sample = _.intersection(total, target)
  return _.size(target) === _.size(sample)
}

/**
 * 是否包含权限
 * @param permissions
 * @returns {boolean}
 */
export function hasPermission (permissions) {
  return authCheck(permissions, 'permission')
}

/**
 * 是否包含角色
 * @param rolesCode
 * @returns {boolean}
 */
export function hasRole (rolesCode) {
  return authCheck(rolesCode, 'role')
}

export function translateAmount (data) {
  if (!data) {
    data = 0
  }
  return data.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const normFile = (e) => {
  console.log('Upload event:', e)
  if (Array.isArray(e)) {
    return e
  }

  return e && [_.get(e.file, 'response.data', e.file)]
}

export const normMultipleFiles = (e) => {
  console.log('Upload event:', e)
  if (Array.isArray(e)) {
    return e
  }
  const list = []
  for (let i = 0; i < e.fileList.length; i++) {
    let item = e.fileList[i]
    item = _.get(item, 'response.data', item)
    list.push(item)
  }

  return list
}

export function onSuccessPayload (payload) {
  const onSuccess = _.get(payload, 'onSuccess')
  return [_.omit(payload, ['onSuccess']), _.isFunction(onSuccess) ? onSuccess : undefined]
}

export function randomRange (min, max) {
  let returnStr = ''
  const range = (max ? Math.round(Math.random() * (max - min)) + min : min)
  const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  for (let i = 0; i < range; i++) {
    const index = Math.round(Math.random() * (arr.length - 1))
    returnStr += arr[index]
  }
  return returnStr
}

// 字符串（时间格式处理）
export function stringTimeFormat (str, format = 'YYYY-MM-DDTHH:mm:ssZ') {
  if (!str || typeof str !== 'string') {
    return str
  }
  return moment(str).format(format)
}

// 生成16位随机数
export function createRandomNum () {
  // const date = moment().unix().toString()
  // const randomStart = (Math.random() * 100000000).toString().substr(0, 4)
  // const randomEnd = Math.random().toString().substr(2, 2)
  // return randomStart + date + randomEnd
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 秒、纳秒转换
export function switchNanoSecond (num, type = '纳秒') {
  if (typeof num !== 'number') {
    num = Number(num)
  }
  if (type === '秒') {
    return num / (10 ** 9)
  }
  if (type === '纳秒') {
    return num * (10 ** 9)
  }
  return num
}

// 随机生成一个颜色值
export function getRandomColor () {
  const list = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
  let color = '#'
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * (list.length - 1))
    color += list[index]
  }
  return color
}

// 将秒转换成天/分钟/秒
export function getFormatSeconds (num) {
  if (typeof num !== 'number') {
    return 0
  }
  if (num === 0) {
    return '0 秒'
  }
  let second = parseInt(num)
  let minute = 0 // 分
  let hour = 0 // 小时
  let day = 0 // 天
  if (second > 60) {
    minute = parseInt(second / 60)
    second = parseInt(second % 60)
    if (minute > 60) {
      hour = parseInt(minute / 60)
      minute = parseInt(minute % 60)
      if (hour > 24) {
        day = parseInt(hour / 24)
        hour = parseInt(hour % 24)
      }
    }
  }
  let result = ''
  if (second > 0) {
    result = `${parseInt(second)}秒`
  }
  if (minute > 0) {
    result = `${parseInt(minute)}分钟` + result
  }
  if (hour > 0) {
    result = `${parseInt(hour)}小时` + result
  }
  if (day > 0) {
    result = `${parseInt(day)}天` + result
  }
  return result
}

export function formRequired (L) {
  return {
    fieldOptions: {
      rules: [
        {
          required: true,
          message: L('tkh_form_required', '选项不能为空')
        }
      ]
    }
  }
}
