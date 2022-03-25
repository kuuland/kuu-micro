import React from 'react'
import filesize from 'filesize'
import mime from 'mime'
import { Upload, message } from 'antd'
import { FanoTable } from 'fano-antd'
import { connect } from 'umi'
import { withLocale, withPrefix } from 'kuu-tools'
import styles from './index.less'
import _ from 'lodash'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import moment from 'moment'

class File extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const origin = window.location.origin
    const columns = [
      {
        title: this.props.L('kuu_file_name', 'Name'),
        dataIndex: 'name',
        width: 300,
        render: (name, record) => (
          <CopyToClipboard text={origin + record.url} onCopy={() => message.success('复制成功!')}>
            <a
              href={record.URL}
              target='_blank'
              rel='noopener noreferrer'
              onClick={e => {
                e.stopPropagation()
              }}
            >
              {name}
            </a>
          </CopyToClipboard>
        )
      },
      {
        title: this.props.L('kuu_file_preview', 'Preview'),
        dataIndex: 'url',
        width: 300,
        render: 'file'
      },
      {
        title: this.props.L('kuu_file_size', 'Size'),
        dataIndex: 'size',
        render: t => _.isNumber(t) ? filesize(t) : ''
      },
      {
        title: this.props.L('kuu_file_type', 'Mine-Type'),
        dataIndex: 'type',
        render: t => (mime.getExtension(t) || '').toUpperCase()
      },
      {
        title: this.props.L('kuu_file_createdat', 'Created At'),
        dataIndex: 'CreatedAt',
        render: t => moment(t).fromNow()
      }
    ]
    const headers = {
      Authorization: 'Bearer ' + this.props.token
    }
    return (
      <div className={`kuu-container ${styles.file}`}>
        <FanoTable
          ref={instance => {
            this.table = instance
          }}
          columns={columns}
          tableActions={[
            {
              key: 'upload',
              icon: 'upload',
              text: this.props.L('kuu_file_actions_upload', 'Upload'),
              wrapper: children => (
                <Upload
                  multiple
                  showUploadList={false}
                  name='file'
                  action={withPrefix('/upload')}
                  headers={headers}
                  onChange={info => {
                    if (info.file.status === 'done') {
                      this.table.handleRefresh()
                    }
                  }}
                >
                  {children}
                </Upload>
              )
            }
          ]}
          fillTAP={{ add: false }}
          fillRAP={{ edit: false }}
          rowClickToggleDrawer={false}
          url='/file'
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    token: _.get(state, 'user.loginData.Token')
  }
}

export default withLocale(connect(mapStateToProps)(File))
