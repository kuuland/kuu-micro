import React from 'react'
import _ from 'lodash'
import { FanoTable } from 'fano-antd'
import { connect } from 'umi'
import { withLocale } from 'kuu-tools'
import { formRequired } from '../../utils/tools'

class MicroApp extends React.Component {
  constructor (props) {
    super(props)
    this.form = React.createRef()
    this.state = {}
  }

  render () {
    const columns = [
      {
        title: this.props.L('aicrm_microapp_name', '名称'),
        dataIndex: 'Name'
      },
      {
        title: this.props.L('aicrm_microapp_MicroApp', '微应用'),
        dataIndex: 'MicroApp'
      },
      {
        title: this.props.L('aicrm_microapp_Entry', '入口'),
        dataIndex: 'Entry'
      },
      {
        title: this.props.L('aicrm_microapp_Path', '路由'),
        dataIndex: 'Path'
      },
      {
        title: this.props.L('aicrm_microapp_Enable', '是否启用'),
        dataIndex: 'Enable',
        render: t => t ? '启用' : '禁用'
      }
    ]

    const form = [
      {
        name: 'Name',
        type: 'input',
        props: {
          ...formRequired(this.props.L)
        }
      },
      {
        name: 'MicroApp',
        type: 'input',
        props: {
          ...formRequired(this.props.L)
        }
      },
      {
        name: 'Entry',
        type: 'input',
        props: {
          ...formRequired(this.props.L)
        }
      },
      {
        name: 'Path',
        type: 'input',
        props: {
          ...formRequired(this.props.L)
        }
      },
      {
        name: 'Enable',
        type: 'select',
        props: {
          ...formRequired(this.props.L),
          options: [
            { label: '启用', value: true },
            { label: '禁用', value: false }
          ]
        }
      }
    ]

    const filter = [
      {
        name: 'Name',
        operators: ['like']
      }
    ]
    return (
      <div className='kuu-container'>
        <FanoTable
          url='/micro/frontend'
          listUrl='/micro/frontend'
          columns={columns}
          form={form}
          filterReplace
          filter={filter}
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

export default withLocale(connect(mapStateToProps)(MicroApp))
