import React from 'react'
import _ from 'lodash'
import { Icon, DatePicker } from 'antd'
import styles from './DateListEdit.less'
import moment from 'moment'

const { RangePicker } = DatePicker

class DateListEdit extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
    this.handleAdd = this.handleAdd.bind(this)
  }

  getDefault () {
    return [{ ID: 0.1 }]
  }

  handleItemChange (id, value) {
    const values = _.isEmpty(this.props.value) ? this.getDefault() : this.props.value
    const index = _.findIndex(values, { ID: id })
    values[index].DateStart = value[0].format()
    values[index].DateEnd = value[1].format()
    this.handleChange(values)
  }

  handleAdd () {
    const values = _.isEmpty(this.props.value) ? this.getDefault() : this.props.value
    values.push({ ID: _.random(true) })
    this.handleChange(values)
  }

  handleDel (id) {
    const values = _.isEmpty(this.props.value) ? this.getDefault() : this.props.value
    const index = _.findIndex(values, { ID: id })
    if (values[index].ID > 1) {
      values[index].DeletedAt = moment().format()
    } else {
      values.splice(index, 1)
    }
    this.handleChange(values)
  }

  handleChange (v) {
    if (_.isFunction(this.props.onChange)) {
      if (_.size(_.filter(v, item => !item.DeletedAt)) === 0) {
        v.push({ ID: _.random(true) })
      }
      this.props.onChange([...v])
    }
  }

  render () {
    let values = _.isEmpty(this.props.value) ? this.getDefault() : this.props.value
    values = _.filter(values, item => !item.DeletedAt)
    return (
      <div className={`${this.props.className}`} style={this.props.style}>
        {
          _.map(values, (item, index) =>
            <div key={item.ID} className={styles.item}>
              <div className={styles.selectContainer}>
                <RangePicker
                  value={[item.DateStart ? moment(item.DateStart) : undefined, item.DateEnd ? moment(item.DateEnd) : undefined]}
                  onChange={this.handleItemChange.bind(this, item.ID)}
                />
              </div>
              <div className={styles.actions}>
                <Icon
                  className={`${styles.icon} ${styles.icondel}`} type='minus-circle'
                  onClick={this.handleDel.bind(this, item.ID)}
                />
                {
                  index === 0 &&
                    <Icon className={styles.icon} type='plus-circle' onClick={this.handleAdd} />
                }
              </div>
            </div>
          )
        }

      </div>
    )
  }
}

export default DateListEdit
