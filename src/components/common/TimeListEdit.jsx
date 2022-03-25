import React from 'react'
import _ from 'lodash'
import { Icon, TimePicker } from 'antd'
import styles from './TimeListEdit.less'
import moment from 'moment'

const format = 'HH:mm'

class TimeListEdit extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
    this.handleAdd = this.handleAdd.bind(this)
  }

  getDefault () {
    return [{ ID: 0.1 }]
  }

  handleItemChange (id, filed, value) {
    const values = _.isEmpty(this.props.value) ? this.getDefault() : this.props.value
    const index = _.findIndex(values, { ID: id })
    values[index][filed] = value.format(format)
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
                <TimePicker
                  className={styles.time}
                  value={item.TimeStart ? moment(item.TimeStart, format) : undefined}
                  format={format}
                  onChange={this.handleItemChange.bind(this, item.ID, 'TimeStart')}
                />
                <div className={styles.split}>~</div>
                <TimePicker
                  className={styles.time}
                  value={item.TimeEnd ? moment(item.TimeEnd, format) : undefined}
                  format={format}
                  onChange={this.handleItemChange.bind(this, item.ID, 'TimeEnd')}
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

export default TimeListEdit
