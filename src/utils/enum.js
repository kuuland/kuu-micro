import _ from 'lodash'

export function renderLabel (value, options, split = false) {
  const items = split ? _.split(value, ',') : [value]
  return _.chain(items).map(t => {
    const v = _.get(options.ValueMap, `${t}.Label`)
    return v
  }).compact().join('、').value()
}

export function convertOptions (options) {
  return _.map(_.get(options, 'Values'), option => {
    return {
      value: option.Value,
      label: option.Label
    }
  })
}
