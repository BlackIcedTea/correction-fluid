import React, { Component, PropTypes } from 'react'
import _ from 'lodash'
import pure from 'purecss'
import classNames from 'classnames'
import update from 'react-addons-update'

export default class RuleInlineCreator extends Component {
  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      rule: {
        id: this.props.rules.reduce((maxId, rule) => Math.max(rule.id, maxId), -1) + 1,
        name: '',
        url: '',
        find: '',
        replace: '',
        selector: ''
      }
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

  handleAdd = (event) => {
    const { addRule } = this.props.creators
    addRule(this.state.rule)
    this.setState(update(this.state, {
      rule: {
        $set: {
          id: this.props.rules.reduce((maxId, rule) => Math.max(rule.id, maxId), -1) + 1,
          name: '',
          url: '',
          find: '',
          replace: '',
          selector: ''
        }
      }
    }))
  }

  render() {

    return (
      <tr>
        <td>{this.state.id}</td>
          <td>
            <input id="name" type="text" value={this.state.rule.name}
              onChange={this.linkState('rule.name')}
            />
          </td>
        <td>
          <input id="url" type="text" list="datalist-url"
            value={this.state.rule.url} onChange={this.linkState('rule.url')}
          />
          <datalist id="datalist-url">
            <option value="*" />
          </datalist>
        </td>
        <td>
          <input id="find" type="text"
            value={this.state.rule.find} onChange={this.linkState('rule.find')}
          />
        </td>
        <td>
          <input id="replace" type="text"
            value={this.state.rule.replace} onChange={this.linkState('rule.replace')}
          />
        </td>
        <td>
          <input id="selector" type="text"
            value={this.state.rule.selector} onChange={this.linkState('rule.selector')}
          />
        </td>
        <td>
          <input type="checkbox" checked disabled />
        </td>
        <td>
          <button className={classNames(pure['pure-button'], pure['pure-button-primary'])}
            onClick={this.handleAdd}
          >
          Okay
          </button>
        </td>
      </tr>
    )
  }
}
