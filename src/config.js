import { Icon } from 'antd'

export default {
  // shortName: <img src={require('@/assets/logo.jpg')} height='50px' />,
  // fullName: <img src={require('@/assets/logo.jpg')} height='50px' />,
  shortName: 'AI CRM',
  fullName: 'AI CRM',
  htmlTitle: 'AI CRM',
  simplePages: ['/login', '/test', '/app_login', '/app_doc', '/forgot'],
  whiteRoutes: ['/app_login', '/app_doc', '/forgot'],
  noBreadcrumbsRoutes: [],
  loginPathname: '/login',
  storageTokenKey: 'token',
  storageLocaleKey: 'kuu_locale',
  storageLocaleMessagesKey: 'kuu_locale_messages',
  copyright: <div><Icon type='copyright' /> {new Date().getFullYear()} <a rel='noopener noreferrer' target='_blank' href='https://www.hofo.co' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>蚁群科技</a> 提供技术支持 | Powered by <a rel='noopener noreferrer' target='_blank' href='https://github.com/kuuland/kuu'><Icon type='github' /> Kuu</a>. All Rights Reserved</div>,
  loginBg: '',
  prefixUrl: '/gw'
}
