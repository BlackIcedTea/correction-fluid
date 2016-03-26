import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import update from 'react-addons-update'
import pure from 'purecss'
import classNames from 'classnames'

export default class RuleCreator extends Component {
  static propTypes = {
    rule: PropTypes.object.isRequired,
    creators: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      editing: false,
      rule: Object.assign({}, this.props.rule)
    }
  }

  handleIsEnabledChange = e => {
    const { rule } = this.props
    const { enableRule, disableRule } = this.props.creators
    if (e.target.checked) {
      enableRule(rule.id)
    } else {
      disableRule(rule.id)
    }
  }

  handleEdit = e => {
    this.setState(update(this.state, {
      editing: {
        $set: true
      },
      rule: {
        $set: Object.assign({}, this.props.rule)
      }
    }))
  }

  handleCancel = e => {
    this.setState(update(this.state, {
      editing: {
        $set: false
      }
    }))
  }

  handleSave = e => {
    const { rule } = this.state
    const { editRule } = this.props.creators
    editRule(rule.id, rule.url, rule.find, rule.replace, rule.selector)
    this.setState(update(this.state, {
      editing: {
        $set: false
      }
    }))
  }

  handleDelete = e => {
    const { rule } = this.props
    const { deleteRule } = this.props.creators
    deleteRule(rule.id)
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
    const rule = this.props.rule
    const state = this.state

    if (state.editing) {
      return (
        <tr>
          <td>{rule.id}</td>
          <td>
            <input id="name" type="text" value={state.rule.name}
              onChange={this.linkState('rule.name')}
            />
          </td>
          <td>
            <input id="url" type="text" list="datalist-url"
              value={state.rule.url} onChange={this.linkState('rule.url')}
            />
            <datalist id="datalist-url">
              <option value="*" />
            </datalist>
          </td>
          <td>
            <input id="find" type="text"
              value={state.rule.find} onChange={this.linkState('rule.find')}
            />
          </td>
          <td>
            <input id="replace" type="text"
              value={state.rule.replace} onChange={this.linkState('rule.replace')}
            />
          </td>
          <td>
            <input id="selector" type="text"
              value={state.rule.selector} onChange={this.linkState('rule.selector')}
            />
          </td>
          <td>
            <input type="checkbox" checked={rule.isEnabled}
              onChange={this.handleIsEnabledChange}
            />
          </td>
          <td>
            <button className={pure['pure-button']} onClick={this.handleSave}>
            Save
            </button>
            <button className={pure['pure-button']} onClick={this.handleCancel}>
            Cancel
            </button>
          </td>
        </tr>
      )
    }
    return (
      <tr>
        <td>{rule.id}</td>
        <td>{rule.name}</td>
        <td>{rule.url}</td>
        <td>{rule.find}</td>
        <td>{rule.replace}</td>
        <td>{rule.selector}</td>
        <td>
          <input type="checkbox" checked={rule.isEnabled}
            onChange={this.handleIsEnabledChange}
          />
        </td>
        <td>
          <button className={pure['pure-button']} onClick={this.handleEdit}>
          Edit
          </button>
          <button className={pure['pure-button']} onClick={this.handleDelete}>
          Delete
          </button>
        </td>
      </tr>
    )
  }
}
