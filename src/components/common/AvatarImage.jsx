import React from 'react'
import { Avatar, Modal } from 'antd'
import _ from 'lodash'

export default function AvatarImage (props) {
  const { avatar, style = {}, imageStyle = {} } = props
  const defaultStyle = {
    display: 'flex',
    alignItems: 'center'
  }
  const defaultImageStyle = {
    maxHeight: 500,
    maxWidth: 700
  }
  return (
    <div style={{ ...defaultStyle, ...style }}>
      <Avatar
        size='large'
        icon='user'
        src={avatar}
        onClick={e => {
          e.stopPropagation()
          Modal.info({
            className: 'fano-rowrender-file-preview',
            maskClosable: true,
            content: <img alt='avatar' src={avatar} style={{ ...defaultImageStyle, ...imageStyle }} />
          })
        }}
        style={{ cursor: 'pointer' }}
        {..._.omit(props, ['avatar', 'style', 'imageStyle', 'children'])}
      />
      {props.children}
    </div>
  )
}
