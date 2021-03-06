import React from 'react'
import _ from 'lodash'
import { Icon } from 'antd'
import { FanoTable } from 'fano-antd'
import { parseIcon, withLocale } from 'kuu-tools'
import styles from './index.less'
import { getDvaApp } from 'umi'

class Menu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleAddSubmenu = this.handleAddSubmenu.bind(this)
  }

  handleAddSubmenu (record) {
    this.table.handleAdd({ ParentCode: _.get(record, 'Code') || 'default' })
  }

  // 处理菜单页直接跳转
  handleOpenPane (pane) {
    getDvaApp()._store.dispatch({
      type: 'layout/openPane',
      payload: {
        ...pane
      }
    })
  }

  render () {
    const columns = [
      {
        title: this.props.L('kuu_menu_name', 'Name'),
        dataIndex: 'Name',
        width: 300,
        render: (t, r) => {
          let children = (
            <span>
              {r.Icon && <Icon {...parseIcon(r.Icon)} />} {this.props.L(
                r.LocaleKey, t)} {r.IsLink && <Icon type='link' />}
            </span>
          )

          if (r.URI) {
            children = (
              <a onClick={() => this.handleOpenPane(r)} title={r.URI}>
                {children}
              </a>
            )
          }
          return children
        }
      },
      {
        title: this.props.L('kuu_menu_code', 'Permission Code'),
        width: 120,
        dataIndex: 'Code'
      },
      {
        title: this.props.L('kuu_menu_disable', 'Disable'),
        dataIndex: 'Disable',
        width: 150,
        align: 'center',
        render: t => t ? <Icon type='eye-invisible' style={{ fontSize: 18 }} />
          : <Icon type='eye' style={{ color: '#52c41a', fontSize: 18 }} />
      }
    ]
    const form = [
      {
        name: 'ParentCode',
        type: 'treeselect',
        label: this.props.L('kuu_menu_parent', 'Parent Menu'),
        props: {
          layout: {
            span: 24
          },
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_menu_name_required', 'Please select a parent menu')
              }
            ]
          },
          url: '/user/menus',
          titleKey: 'Name',
          valueKey: 'Code',
          titleRender: (title, item) => {
            title = this.props.L(item.LocaleKey, title)
            return item.Icon
              ? <span><Icon {...parseIcon(item.Icon)} /> {title}</span>
              : title
          },
          filterTreeNode: (inputValue, treeNode) => {
            const item = treeNode.props
            const title = this.props.L(item.LocaleKey, item.Name, null, true)
            return title && _.isFunction(title.includes) ? title.includes(
              inputValue) : false
          },
          arrayToTree: {
            customID: 'Code',
            parentProperty: 'ParentCode',
            childrenProperty: 'children'
          }
        }
      },
      {
        name: 'Name',
        type: 'input',
        props: {
          layout: {
            span: 12
          },
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_menu_name_required', 'Please enter a menu name')
              }
            ]
          }
        }
      },
      {
        name: 'Code',
        type: 'input',
        props: {
          layout: {
            span: 12
          },
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_menu_name_required', 'Please enter a menu name')
              }
            ]
          }
        }
      },
      {
        name: 'URI',
        type: 'input',
        label: this.props.L('kuu_menu_uri', 'URI'),
        props: {
          layout: {
            span: 24
          }
        }
      },
      {
        name: 'LocaleKey',
        type: 'input',
        label: this.props.L('kuu_menu_localekey', 'Locale Key'),
        props: {
          layout: {
            span: 24
          }
        }
      },
      {
        name: 'Icon',
        type: 'icon',
        label: this.props.L('kuu_menu_icon', 'Icon'),
        props: {
          layout: {
            span: 24
          }
        }
      },
      {
        name: 'Sort',
        type: 'number',
        label: this.props.L('kuu_menu_sort', 'Sort'),
        props: {
          layout: {
            span: 24
          }
        }
      },
      {
        name: 'IsLink',
        type: 'switch',
        label: this.props.L('kuu_menu_external', 'External link'),
        props: {
          layout: {
            xs: 24,
            sm: 12,
            md: 6
          }
        }
      },
      {
        name: 'Disable',
        type: 'switch',
        label: this.props.L('kuu_menu_disable', 'Disable'),
        props: {
          layout: {
            xs: 24,
            sm: 12,
            md: 6
          }
        }
      },
      {
        name: 'IsDefaultOpen',
        type: 'switch',
        label: this.props.L('kuu_menu_defaultopen', 'Open by default'),
        props: {
          layout: {
            xs: 24,
            sm: 12,
            md: 6
          }
        }
      },
      {
        name: 'Closeable',
        type: 'switch',
        label: this.props.L('kuu_menu_closeable', 'Closeable'),
        props: {
          layout: {
            xs: 24,
            sm: 12,
            md: 6
          }
        }
      }
    ]
    const formInitialValue = {
      ParentCode: 'default',
      Closeable: true,
      Icon: 'outlined:file'
    }
    const filter = [
      'Name',
      'Code'
    ]
    const onFilter = (cond, dataSource) => {
      const condValues = {}
      for (const item of cond) {
        condValues[item.name] = item.value
      }
      if (!_.isEmpty(condValues)) {
        const newDataSource = []
        const searchValue = (list) => {
          for (const item of list) {
            const title = this.props.L(item.LocaleKey, item.Name, null, true)
            if (_.isEmpty(item.children)) {
              if ((condValues.Name && title.includes(condValues.Name)) ||
                (condValues.Code && item.Code.includes(condValues.Code))) {
                newDataSource.push(item)
              }
            } else {
              const sub = searchValue(item.children)
              if (!_.isEmpty(sub)) {
                newDataSource.push(item)
              }
            }
          }
        }
        searchValue(dataSource)
        return newDataSource
      }
      return dataSource
    }
    const arrayToTree = {
      customID: 'Code',
      parentProperty: 'ParentCode',
      childrenProperty: 'children'
    }
    const onFormValuesChange = (changedValues, allValues) => {
      if (_.has(changedValues, 'Code')) {
        this.table.setFormValue({ LocaleKey: `menu_${changedValues.Code}` })
      }
    }
    return (
      <div className={`kuu-container ${styles.menu}`}>
        <FanoTable
          columns={columns}
          form={form}
          formInitialValue={formInitialValue}
          url='/menu'
          listUrl='/user/menus?default=false'
          filter={filter}
          filterFormCols={2}
          filterReplace
          onFilter={onFilter}
          ref={table => {
            this.table = table
          }}
          onFormValuesChange={onFormValuesChange}
          fillTAP={{
            filter: false,
            sort: false
          }}
          rowActions={[
            {
              key: 'add_submenu',
              icon: 'apartment',
              onClick: this.handleAddSubmenu,
              text: this.props.L('kuu_menu_add_submenu', 'Add Submenu')
            }
          ]}
          pagination={false}
          expandAllRows
          arrayToTree={arrayToTree}
        />
      </div>
    )
  }
}

export default withLocale(Menu)
