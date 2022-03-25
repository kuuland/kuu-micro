import React from 'react'
import md5 from 'blueimp-md5'
import { connect } from 'umi'
import { Modal, Input, Form, message } from 'antd'
import { withLocale, post } from 'kuu-tools'
import styles from './navbar.less'

class ChangePasswd extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      confirmDirty: false
    }
    this.compareToFirstPassword = this.compareToFirstPassword.bind(this)
    this.validateToNextPassword = this.validateToNextPassword.bind(this)
  }

  validateToNextPassword (rule, value, callback) {
    const { form } = this.props
    if (value && this.state.confirmDirty) {
      form.validateFields(['rePasswd'], { force: true })
    }
    callback()
  }

  compareToFirstPassword (rule, value, callback) {
    const { form } = this.props
    if (value && value !== form.getFieldValue('newPasswd')) {
      callback(this.props.L('kuu_navbar_changepasswd_two_same', '新密码必需一致'))
    } else {
      callback()
    }
  }

  handleSubmit () {
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        console.log('Received values of form: ', values)
        return
      }
      const body = {
        OldPasswd: md5(values.oldPasswd),
        NewPasswd: md5(values.newPasswd)
      }
      const res = await post('/changepasswd', body)
      console.log(res)
      if (res) {
        message.success(this.props.L('kuu_navbar_changepasswd_success', '修改密码成功'))
        this.props.onCancel()
      }
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    return (
      <Modal
        title={this.props.L('kuu_navbar_changepasswd', '修改密码')}
        visible={this.props.visible}
        className={styles.changePasswdModal}
        onOk={this.handleSubmit.bind(this)}
        onCancel={this.props.onCancel}
        okText={this.props.L('kuu_navbar_Confirm_changes', '确认修改')}
      >
        <div className={styles.changePasswdbox}>
          <Form>
            <Form.Item label=''>
              {getFieldDecorator('oldPasswd', {
                rules: [
                  { required: true, message: this.props.L('kuu_form_required', '此项必填') }
                ]
              })(
                <Input.Password
                  className={styles.passwdinput}
                  placeholder={this.props.L('kuu_navbar_oldpasswd', '旧密码')}
                />
              )}
            </Form.Item>
            <Form.Item label=''>
              {getFieldDecorator('newPasswd', {
                rules: [
                  { required: true, message: this.props.L('kuu_form_required', '此项必填') },
                  { validator: this.validateToNextPassword }
                ]
              })(
                <Input.Password
                  className={styles.passwdinput}
                  placeholder={this.props.L('kuu_navbar_newpasswd', '新密码')}
                />
              )}
            </Form.Item>
            <Form.Item label=''>
              {getFieldDecorator('rePasswd', {
                rules: [
                  { required: true, message: this.props.L('kuu_form_required', '此项必填') },
                  { validator: this.compareToFirstPassword }
                ]
              })(
                <Input.Password
                  className={styles.passwdinput}
                  placeholder={this.props.L('kuu_navbar_newpasswd', '新密码')}
                  onBlur={(e) => this.setState({ confirmDirty: this.state.confirmDirty || !!e.target.value })}
                />
              )}
            </Form.Item>
          </Form>
        </div>
      </Modal>
    )
  }
}

function mapStateToProps (state) {
  return {}
}

export default withLocale(connect(mapStateToProps)(Form.create()(ChangePasswd)))
