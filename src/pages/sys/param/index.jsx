import React from 'react'
import _ from 'lodash'
import { FanoTable, types } from 'fano-antd'
import { connect } from 'umi'
import moment from 'moment'
import { withLocale } from 'kuu-tools'
import styles from './index.less'

class Param extends React.Component {
  constructor (props) {
    super(props)
    this.form = React.createRef()
    this.state = {}
  }

  getComponentProps (type, props) {
    const p = { ...props }
    const handlerPicker = (format, isRange) => {
      _.set(p, 'config.props.format', format)
      if (isRange) {
        if (_.isArray(p.value)) {
          for (const index in p.value) {
            let item = p.value[index]
            if (!(item instanceof moment)) {
              item = moment(item, format)
            }
            if (!item || !item.isValid()) {
              item = moment()
            }
            p.value[index] = item
          }
        } else {
          p.value = undefined
        }
      } else {
        if (!(p.value instanceof moment)) {
          p.value = moment(p.value, format)
        }
        if (!p.value || !p.value.isValid()) {
          p.value = moment()
        }
      }
    }
    switch (type) {
      case 'input':
      case 'textarea':
      case 'editor':
      case 'icon':
      case 'color':
      case 'json':
        break
      case 'upload':
        if (_.isString(p.value)) {
          try {
            p.value = JSON.parse(p.value)
          } catch (e) {}
        }
        _.set(p, 'config.props.multiple', true)
        break
      case 'number':
        if (!_.isNumber(p.value)) {
          if (_.isString(p.value)) {
            p.value = p.value.includes('.') ? parseFloat(p.value) : parseInt(p.value)
          }
          p.value = _.isFinite(p.value) ? p.value : 0
        }
        break
      case 'password':
        _.set(p, 'config.props.type', 'password')
        break
      case 'switch':
        if (!_.isBoolean(p.value)) {
          if (_.isString(p.value)) {
            p.value = p.value.toLowerCase()
            if (p.value === 'true') {
              p.value = true
            } else if (p.value === 'false') {
              p.value = false
            }
          } else {
            p.value = !!p.value
          }
        }
        break
      case 'datepicker':
        handlerPicker('YYYY-MM-DD')
        break
      case 'rangepicker':
        handlerPicker('YYYY-MM-DD', true)
        break
      case 'monthpicker':
        handlerPicker('YYYY-MM')
        break
      case 'weekpicker':
        handlerPicker('YYYY-wo')
        break
      case 'timepicker':
        handlerPicker('HH:mm:ss')
        break
    }
    return p
  }

  transferDoc (doc) {
    if (_.has(doc, 'Value') && !_.isString(doc.Value)) {
      doc.Value = ![null, undefined].includes(doc.Value) ? JSON.stringify(doc.Value) : doc.Value
    }
    return doc
  }

  render () {
    let defaultCond = '{}'
    if (!this.props.isRoot) {
      defaultCond = '{"$or":[{"IsBuiltIn":false},{"IsBuiltIn":{"$exists":false}}]}'
    }
    const columns = [
      {
        title: this.props.L('kuu_param_name', 'Name'),
        dataIndex: 'Name'
      },
      {
        title: this.props.L('kuu_param_code', 'Code'),
        dataIndex: 'Code'
      },
      {
        title: this.props.L('kuu_param_createdat', 'Created At'),
        dataIndex: 'CreatedAt',
        render: t => moment(t).fromNow()
      }
    ]
    const form = [
      {
        name: 'Name',
        type: 'input',
        props: {
          layout: {
            span: 12
          }
        }
      },
      {
        name: 'Code',
        type: 'input',
        props: {
          layout: {
            span: 12
          }
        }
      },
      {
        name: 'Type',
        type: 'select',
        label: this.props.L('kuu_param_type', 'Type'),
        props: {
          layout: {
            span: 24
          },
          options: [
            {
              label: this.props.L('kuu_param_type_input', 'Input'),
              value: 'input'
            },
            {
              label: this.props.L('kuu_param_type_password', 'Password'),
              value: 'password'
            },
            {
              label: this.props.L('kuu_param_type_number', 'Number'),
              value: 'number'
            },
            {
              label: this.props.L('kuu_param_type_textarea', 'Textarea'),
              value: 'textarea'
            },
            {
              label: this.props.L('kuu_param_type_editor', 'Editor'),
              value: 'editor'
            },
            {
              label: this.props.L('kuu_param_type_json', 'JSON'),
              value: 'json'
            },
            {
              label: this.props.L('kuu_param_type_switch', 'Switch'),
              value: 'switch'
            },
            {
              label: this.props.L('kuu_param_type_upload', 'Upload'),
              value: 'upload'
            },
            {
              label: this.props.L('kuu_param_type_datepicker', 'DatePicker'),
              value: 'datepicker'
            },
            {
              label: this.props.L('kuu_param_type_rangepicker', 'RangePicker'),
              value: 'rangepicker'
            },
            {
              label: this.props.L('kuu_param_type_monthpicker', 'MonthPicker'),
              value: 'monthpicker'
            },
            {
              label: this.props.L('kuu_param_type_weekpicker', 'WeekPicker'),
              value: 'weekpicker'
            },
            {
              label: this.props.L('kuu_param_type_timepicker', 'TimePicker'),
              value: 'timepicker'
            },
            {
              label: this.props.L('kuu_param_type_color', 'Color'),
              value: 'color'
            },
            {
              label: this.props.L('kuu_param_type_icon', 'Icon'),
              value: 'icon'
            }
          ]
        }
      },
      {
        name: 'Value',
        type: 'render',
        label: this.props.L('kuu_param_value', 'Value'),
        props: {
          layout: {
            span: 24
          },
          render: props => {
            const type = _.get(props, 'rootProps.value.Type') || 'input'
            let componentType = type
            if (type === 'password') {
              componentType = 'input'
            }
            const Component = types[componentType]
            return <Component {...this.getComponentProps(type, props)} />
          }
        }
      }
    ]
    return (
      <div className={`kuu-container ${styles.param}`}>
        <FanoTable
          url='/param'
          listUrl={`/param?preload=Org&cond=${defaultCond}`}
          columns={columns}
          form={form}
          drawerWidth={800}
          onFormRecord={record => {
            record.Type = record.Type || 'input'
          }}
          formInitialValue={{
            Type: 'input'
          }}
          beforeUpdate={body => {
            body.doc = this.transferDoc(body.doc)
          }}
          beforeCreate={body => {
            this.transferDoc(body)
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

export default withLocale(connect(mapStateToProps)(Param))
