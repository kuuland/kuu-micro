import React from 'react'
import { connect, history as router } from 'umi'
import md5 from 'blueimp-md5'

import _ from 'lodash'
import { Form, Icon, Input, Button, message } from 'antd'
import styles from './login.less'
import { post, withLocale } from 'kuu-tools'
import config from '@/config'

class Forgot extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      confirmDirty: false,
      time: 0
    }
    this.handleSend = this.handleSend.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
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
    if (value && value !== form.getFieldValue('Password')) {
      callback(this.props.L('kuu_navbar_changepasswd_two_same', '新密码必需一致'))
    } else {
      callback()
    }
  }

  handleSend (e) {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return
      }
      const body = {
        Email: values.email
      }
      const res = await post('/forgot', body)
      console.log('res', res)
      if (res) {
        this.setState({ sended: true, time: 60 })
        this.timer = setInterval(() => {
          const time = this.state.time - 1
          this.setState({ sended: true, time: time })
          if (time === 0) {
            clearInterval(this.timer)
          }
        }, 1000)
      }
    })
  }

  handleSubmit (e) {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return
      }
      console.log('values', values)
      const body = {
        Code: _.get(this.props, 'location.query.code'),
        Password: md5(values.Password)
      }
      const res = await post('/reset', body)
      if (res) {
        message.success(this.props.L('kuu_forgot_reset_success', '重置密码成功， 请重新登录系统！'))
        router.push('/login')
      }
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const style = {}
    if (config.loginBg) {
      style.backgroundImage = `url(${config.loginBg})`
    }
    const code = _.get(this.props, 'location.query.code')
    return (
      <div className={styles.login} style={style}>
        <div className={styles.content}>
          <div className={styles.title}>{config.fullName}</div>
          <p
            className={styles.welcome}
            style={{ display: styles.welcome ? 'block' : 'none' }}
          >{code ? '重置密码' : '忘记密码'}
          </p>
          {
            code &&
              <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
                <Form.Item>
                  {getFieldDecorator('Password', {
                    rules: [
                      { required: true, message: this.props.L('kuu_required', '请输入密码!') },
                      { validator: this.validateToNextPassword }
                    ]
                  })(
                    <Input.Password
                      prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder={this.props.L('kuu_forgot_password_placeholder', 'Password')}
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator('rePasswd', {
                    rules: [
                      { required: true, message: this.props.L('kuu_required', '请输入密码!') },
                      { validator: this.compareToFirstPassword }
                    ]
                  })(
                    <Input.Password
                      prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder={this.props.L('kuu_forgot_password_placeholder', 'Password')}
                      onBlur={(e) => this.setState({ confirmDirty: this.state.confirmDirty || !!e.target.value })}
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <a
                      className={styles.forgot} href='/login'
                    >{this.props.L('kuu_login_btn_return_submit', '返回登陆')}
                    </a>
                    <a
                      className={styles.forgot} href='/forgot'
                    >{this.props.L('kuu_login_password_forgot', 'Forgot your password?')}
                    </a>
                  </div>
                  <Button
                    type='primary' htmlType='submit' loading={this.state.loading}
                    disabled={this.state.time > 0}
                    className={styles.submit}
                  >
                    {this.props.L('kuu_forgot_btn_reset', '确认重置密码')}
                  </Button>
                </Form.Item>
              </Form>
          }
          {
            !code &&
              <Form onSubmit={this.handleSend} className={styles.loginForm}>
                <Form.Item>
                  {getFieldDecorator('email', {
                    rules: [{
                      required: true,
                      message: this.props.L('kuu_required', '请输入电子邮箱地址!')
                    }]
                  })(
                    <Input
                      prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder={this.props.L('kuu_forgot_email_placeholder', 'Email')}
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  <Button
                    type='primary' htmlType='submit' loading={this.state.loading}
                    disabled={this.state.time > 0}
                    className={styles.submit}
                  >
                    {this.state.time > 0
                      ? this.props.L('kuu_forgot_btn_resubmit_code', `发送验证码(${this.state.time}s)`)
                      : this.props.L('kuu_forgot_btn_submit_code', '发送验证码')}
                  </Button>
                </Form.Item>
              </Form>
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    loginData: state.user.loginData || {}
  }
}

export default withLocale(connect(mapStateToProps)(Form.create({ name: 'Forgot' })(Forgot)))
