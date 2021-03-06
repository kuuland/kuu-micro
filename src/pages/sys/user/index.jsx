import React from 'react'
import _ from 'lodash'
import { Transfer, Modal, Icon, Spin } from 'antd'
import { connect } from 'umi'
import md5 from 'blueimp-md5'
import { get, list, update, withLocale, orgColumn } from 'kuu-tools'
import { FanoTable } from 'fano-antd'
import styles from './index.less'

class User extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      assignLoading: true
    }

    this.handleAssignOk = this.handleAssignOk.bind(this)
    this.handleAssignCancel = this.handleAssignCancel.bind(this)
  }

  async fetchRoles () {
    const data = await list('role', { range: 'ALL', cond: this.props.isRoot ? {} : { $or: [{ IsBuiltIn: false }, { IsBuiltIn: { $exists: false } }] } })
    this.setState({ roles: _.get(data, 'list', []) })
  }

  fetchUserAssigns () {
    this.setState({ assignLoading: true }, async () => {
      const userAssigns = await get(`/user/role_assigns/${_.get(this.state.assignRecord, 'ID')}`)
      const userAssignsRolesKey = userAssigns.map(item => item.RoleID)
      this.setState({ userAssigns, userAssignsRolesKey, assignLoading: false })
    })
  }

  async handleAssignOk () {
    const { assignRecord, userAssignsRolesKey, userAssigns } = this.state
    // 统计历史
    const hisAssigns = _.chain(userAssigns)
      .groupBy('RoleID')
      .mapValues(values => _.head(values))
      .value()
    // 统计新的
    const newAssigns = userAssignsRolesKey.map(item => {
      const assign = { UserID: assignRecord.ID, RoleID: item }
      const hisID = _.get(hisAssigns, `${item}.ID`)
      if (hisID) {
        assign.ID = hisID
        delete hisAssigns[item]
      }
      return assign
    })
    // 删除未选的
    for (const roleID in hisAssigns) {
      const item = hisAssigns[roleID]
      newAssigns.push({ ID: item.ID, DeletedAt: new Date().toISOString() })
    }
    // 执行修改
    const data = await update(
      'user',
      { ID: assignRecord.ID },
      { RoleAssigns: newAssigns }
    )
    if (!data) {
      return
    }
    // 关闭弹窗
    this.handleAssignCancel()
  }

  handleAssignCancel () {
    this.setState({
      assignRecord: undefined,
      userAssigns: undefined,
      userAssignsRolesKey: undefined
    })
  }

  render () {
    const {
      roles = [],
      userAssignsRolesKey = [],
      assignRecord
    } = this.state

    let defaultCond = '{}'
    if (!this.props.isRoot) {
      defaultCond = '{"$or":[{"IsBuiltIn":false},{"IsBuiltIn":{"$exists":false}}]}'
    }

    const columns = [
      {
        title: this.props.L('kuu_user_username', 'Username'),
        dataIndex: 'Username'
      },
      {
        title: this.props.L('kuu_user_name', 'Real name'),
        dataIndex: 'Name'
      }
    ]
    if (this.props.isRoot) {
      columns.push(orgColumn(this.props.L))
    }
    columns.push(
      {
        title: this.props.L('kuu_user_disable', 'Disable'),
        dataIndex: 'Disable',
        render: 'switch'
      },
      {
        title: this.props.L('kuu_user_createdat', 'Created At'),
        dataIndex: 'CreatedAt',
        render: 'fromNow'
      }
    )
    const form = [
      {
        name: 'Username',
        type: 'input',
        label: this.props.L('kuu_user_username', 'Username')
      },
      {
        name: 'Name',
        type: 'input',
        label: this.props.L('kuu_user_name', 'Real name')
      },
      {
        name: 'Password',
        type: 'input',
        label: this.props.L('kuu_user_password', 'Password'),
        props: {
          type: 'password'
        }
      },
      {
        name: 'Disable',
        type: 'switch',
        label: this.props.L('kuu_user_disable', 'Disable')
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
          valueKey: 'ID'
        }
      })
    }
    return (
      <div className={`kuu-container ${styles.user}`}>
        <FanoTable
          columns={columns}
          form={form}
          actionsWidth={300}
          url='/user'
          listUrl={`/user?preload=Org&cond=${defaultCond}`}
          rowActions={[
            {
              icon: 'key',
              onClick: record => {
                this.setState({ assignRecord: record }, () => {
                  this.fetchUserAssigns()
                  this.fetchRoles()
                })
              },
              text: this.props.L('kuu_user_role_assigns', 'Role Assignments')
            }
          ]}
          beforeSave={values => {
            if (values.Password) {
              values.Password = md5(values.Password)
            } else if (_.get(values, 'doc.Password')) {
              values.doc.Password = md5(values.doc.Password)
            }
          }}
        />
        <Modal
          width={600}
          maskClosable={false}
          title={this.props.L('kuu_user_role_assigns', 'Role Assignments')}
          visible={!!assignRecord}
          onOk={this.handleAssignOk}
          onCancel={this.handleAssignCancel}
          className={styles.assignModal}
        >
          <Spin
            indicator={<Icon type='loading' style={{ fontSize: 24 }} spin />}
            spinning={this.state.assignLoading}
          >
            <Transfer
              rowKey={record => record.ID}
              dataSource={roles}
              titles={[this.props.L('kuu_user_titles_notassigned', 'Not Assigned'), this.props.L('kuu_user_titles_assigned', 'Assigned')]}
              showSearch
              filterOption={(inputValue, option) => option.Name.includes(inputValue)}
              targetKeys={userAssignsRolesKey}
              onChange={(nextTargetKeys) => {
                this.setState({ userAssignsRolesKey: nextTargetKeys })
              }}
              render={item => item.Name}
            />
          </Spin>
        </Modal>
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

export default withLocale(connect(mapStateToProps)(User))
