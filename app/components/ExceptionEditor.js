import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import update from 'react-addons-update'
import pure from 'purecss'
import classNames from 'classnames'
import Textarea from 'react-textarea-autosize'

export default class ExceptionEditor extends Component {
  static propTypes = {
    exceptions: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      text: this.props.exceptions.join('\n')
    }
  }

  updateException = () => {
    const { importExceptions } = this.props.creators
    let newExceptions = this.state.text.split('\n').filter(x => !!x)
    importExceptions(newExceptions)
  }

  linkState = (stateField) => {
    let fields = stateField.split('.')
    let nextState = {}
    return e => {
      _.reduce(fields, (state, field, i) => {
        if (!state[field]) {
          if (i !== _.findLastIndex(fields)) {
            state[field] = {}
          } else {
            state[field] = {
              $set: (type => {
                if (['checkbox', 'radio'].includes(type)) {
                  return e.target.checked
                }
                return e.target.value
              })(e.target.type)
            }
          }
        }
        return state[field]
      }, nextState)
      this.setState(update(this.state, nextState))
    }
  }

  render() {
    return (
      <Textarea
        value={this.state.text}
        onChange={this.linkState('text')}
        onBlur={this.updateException}
      />
    )
  }
}
