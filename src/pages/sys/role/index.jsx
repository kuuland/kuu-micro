import React from 'react'
import { Icon, Input, Select, Button } from 'antd'
import { FanoTable, FanoTreeSelect } from 'fano-antd'
import { connect } from 'umi'
import { parseIcon, withLocale, orgColumn } from 'kuu-tools'
import _ from 'lodash'
import moment from 'moment'
import styles from './index.less'

class Role extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    let defaultCond = '{}'
    if (!this.props.isRoot) {
      defaultCond = '{"$or":[{"IsBuiltIn":false},{"IsBuiltIn":{"$exists":false}}]}'
    }
    const columns = [
      {
        title: this.props.L('kuu_role_name', 'Name'),
        dataIndex: 'Name'
      },
      {
        title: this.props.L('kuu_role_code', 'Code'),
        dataIndex: 'Code'
      }
    ]
    if (this.props.isRoot) {
      columns.push(orgColumn(this.props.L))
    }
    columns.push({
      title: this.props.L('kuu_role_createdat', 'Created At'),
      dataIndex: 'CreatedAt',
      render: t => moment(t).fromNow()
    })
    const form = [
      {
        name: 'Name',
        type: 'input',
        label: this.props.L('kuu_role_name', 'Name'),
        props: {
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_role_name_required', 'Please enter a role name')
              }
            ]
          },
          layout: {
            span: 24
          }
        }
      },
      {
        name: 'Code',
        type: 'input',
        label: this.props.L('kuu_role_code', 'Code'),
        props: {
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_role_code_required', 'Please enter a role code')
              }
            ]
          },
          layout: {
            span: 24
          }
        }
      },
      {
        name: 'ViewOperationPrivileges',
        type: 'treeselect',
        label: this.props.L('kuu_role_op', 'Menu Privileges'),
        props: {
          url: '/user/menus',
          titleKey: 'Name',
          valueKey: 'Code',
          multiple: true,
          treeCheckable: true,
          titleRender: (title, item) => (
            <span>
              <Icon {...parseIcon(item.Icon)} /> {this.props.L(item.LocaleKey || item.Name, item.Name)}
            </span>
          ),
          arrayToTree: {
            customID: 'Code',
            parentProperty: 'ParentCode',
            childrenProperty: 'children'
          },
          layout: {
            span: 24
          }
        }
      },
      {
        name: 'DataPrivileges',
        type: 'render',
        label: this.props.L('kuu_role_dp', 'Data Privileges'),
        props: {
          layout: {
            span: 24
          },
          render: props => {
            return (
              <div>
                {(props.value || []).map((item, index) => {
                  return (
                    <Input.Group
                      className={styles.dpItem}
                      key={item.key || item.ID}
                      compact
                    >
                      <FanoTreeSelect
                        config={{
                          props: {
                            style: { width: 120 },
                            url: '/org?range=ALL&sort=Sort',
                            titleKey: 'Name',
                            valueKey: 'ID',
                            arrayToTree: true,
                            placeholder: this.props.L('kuu_role_select_org_placeholder', 'Please select an organization')
                          }
                        }}
                        value={item.TargetOrgID}
                        onChange={v => {
                          const value = _.cloneDeep(props.value)
                          _.set(value, `[${index}].TargetOrgID`, v)
                          props.onChange(value)
                        }}
                      />
                      <Select
                        defaultValue='PERSONAL'
                        placeholder={this.props.L('kuu_role_readable_range_placeholder', 'Please select a readable range')}
                        value={item.ReadableRange}
                        onChange={v => {
                          const value = _.cloneDeep(props.value)
                          _.set(value, `[${index}].ReadableRange`, v)
                          props.onChange(value)
                        }}
                      >
                        <Select.Option
                          value='PERSONAL'
                        >{this.props.L('kuu_role_data_range_personal', 'PERSONAL')}
                        </Select.Option>
                        <Select.Option
                          value='CURRENT'
                        >{this.props.L('kuu_role_data_range_current', 'CURRENT')}
                        </Select.Option>
                        <Select.Option
                          value='CURRENT_FOLLOWING'
                        >{this.props.L('kuu_role_data_range_current_following', 'CURRENT_FOLLOWING')}
                        </Select.Option>
                      </Select>
                      <Select
                        defaultValue='PERSONAL'
                        placeholder={this.props.L('kuu_role_writable_range_placeholder', 'Please select a writable range')}
                        value={item.WritableRange}
                        onChange={v => {
                          const value = _.cloneDeep(props.value)
                          _.set(value, `[${index}].WritableRange`, v)
                          props.onChange(value)
                        }}
                      >
                        <Select.Option
                          value='PERSONAL'
                        >{this.props.L('kuu_role_data_range_personal', 'PERSONAL')}
                        </Select.Option>
                        <Select.Option
                          value='CURRENT'
                        >{this.props.L('kuu_role_data_range_current', 'CURRENT')}
                        </Select.Option>
                        <Select.Option
                          value='CURRENT_FOLLOWING'
                        >{this.props.L('kuu_role_data_range_current_following', 'CURRENT_FOLLOWING')}
                        </Select.Option>
                      </Select>
                      <Button
                        size='small'
                        type='danger'
                        icon='minus'
                        shape='circle'
                        className={styles.dpItemDel}
                        onClick={() => {
                          const value = _.cloneDeep(props.value)
                          value.splice(index, 1)
                          props.onChange(value)
                        }}
                      />
                    </Input.Group>
                  )
                })}
                <div className={styles.dpItemAdd}>
                  <Button
                    size='small'
                    type='link'
                    icon='plus-circle'
                    onClick={() => {
                      const newVal = {
                        key: new Date().getTime(),
                        RoleID: _.get(props, 'rootProps.value.ID'),
                        ReadableRange: 'CURRENT_FOLLOWING',
                        WritableRange: 'CURRENT_FOLLOWING'
                      }
                      const value = _.cloneDeep(props.value) || []
                      value.push(newVal)
                      props.onChange(value)
                    }}
                  >
                    {this.props.L('kuu_role_addrule', 'Add rule')}
                  </Button>
                </div>
              </div>
            )
          }
        }
      }
    ]
    if (this.props.isRoot) {
      form.unshift({
        name: 'OrgID',
        type: 'treeselect',
        label: this.props.L('kuu_common_org', 'Organization'),
        props: {
          url: `/org?range=ALL&sort=Sort&project=ID,Code,Name,Pid&cond=${defaultCond}`,
          titleKey: 'Name',
          valueKey: 'ID',
          layout: {
            span: 24
          }
        }
      })
    }
    return (
      <div className={`kuu-container ${styles.role}`}>
        <FanoTable
          columns={columns}
          form={form}
          url='/role'
          listUrl={`GET /role?preload=Org,OperationPrivileges,DataPrivileges&cond=${defaultCond}`}
          onFormRecord={record => {
            record.ViewOperationPrivileges = _.chain(record)
              .get('OperationPrivileges', [])
              .filter(item => !_.isEmpty(item.MenuCode))
              .map(item => item.MenuCode)
              .value()
          }}
          beforeSave={(values, formRecord = {}) => {
            // ??????OperationPrivileges
            const viewOps = _.get(values, 'doc.ViewOperationPrivileges', values.ViewOperationPrivileges)
            if (viewOps) {
              const ops = []
              const groupBy = _.groupBy(formRecord.OperationPrivileges, 'MenuCode')
              for (const code of viewOps) {
                const op = _.get(groupBy, `[${code}][0]`)
                if (_.get(op, 'ID')) {
                  delete groupBy[code]
                  continue
                }
                ops.push({
                  MenuCode: code,
                  RoleID: formRecord.ID
                })
              }
              if (!_.isEmpty(groupBy)) {
                for (const code in groupBy) {
                  const item = _.get(groupBy, `[${code}][0]`)
                  if (!_.get(item, 'ID')) {
                    continue
                  }
                  ops.push({ ID: item.ID, DeletedAt: moment().format() })
                }
              }
              if (_.has(values, 'doc')) {
                // ??????
                _.set(values, 'doc.OperationPrivileges', ops)
                delete values.doc.ViewOperationPrivileges
              } else {
                // ??????
                _.set(values, 'OperationPrivileges', ops)
                delete values.ViewOperationPrivileges
              }
            }
            // ??????DataPrivileges
            if (_.has(values, 'doc.DataPrivileges') || _.has(values, 'DataPrivileges')) {
              const dataOps = [...(_.get(values, 'doc.DataPrivileges', values.DataPrivileges) || [])]
              const dataOpsMap = _.groupBy(dataOps, 'ID')
              if (!_.isEmpty(formRecord.DataPrivileges)) {
                for (const item of formRecord.DataPrivileges) {
                  if (_.isEmpty(dataOpsMap[item.ID])) {
                    dataOps.push({ ID: item.ID, DeletedAt: moment().format() })
                  }
                }
                if (_.has(values, 'doc')) {
                  _.set(values, 'doc.DataPrivileges', dataOps)
                } else {
                  _.set(values, 'DataPrivileges', dataOps)
                }
              }
            }
          }}
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    loginData: state.user.loginData || {},
    isRoot: _.get(state, 'user.loginData.Username') === 'root'
  }
}

export default withLocale(connect(mapStateToProps)(Role))
