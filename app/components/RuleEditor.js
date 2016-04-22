import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import update from 'react-addons-update'
import pure from 'purecss'
import classNames from 'classnames'
import yaml from 'js-yaml'
import Textarea from 'react-textarea-autosize'
import Alert from 'react-s-alert'
import 'react-s-alert/dist/s-alert-default.css'

export default class RuleEditor extends Component {
  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      text: yaml.safeDump(this.props.rules)
    }
  }

  handleReload = () => {
    this.setState(update(this.state, {
      text: {
        $set: yaml.safeDump(this.props.rules)
      }
    }))
  }

  handleSave = () => {
    const { importRules } = this.props.creators
    try {
      let newRules = yaml.safeLoad(this.state.text)
      importRules(newRules)
    } catch (e) {
      Alert.error(e.message)
    }
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
      <div>
        <Textarea value={this.state.text} onChange={this.linkState('text')} />
        <Alert />
        <button className={pure['pure-button']} onClick={this.handleReload}>Reload</button>
        <button className={pure['pure-button']} onClick={this.handleSave}>Save</button>
      </div>
    )
  }
}
