import React, { Component, PropTypes } from 'react'
import LinkedStateMixin from 'react-addons-linked-state-mixin'
import update from 'react-addons-update'
import { decorate as mixin } from 'react-mixin'
import ToggleDisplay from 'react-toggle-display'
import pure from 'purecss'
import classNames from 'classnames'

@mixin(LinkedStateMixin)
export default class RuleCreator extends Component {
  static propTypes = {
    rule: PropTypes.object.isRequired,
    creators: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      editing: false,
      rule: {}
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
    editRule(rule.id, rule.url, rule.find, rule.replace)
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

  render() {
    const rule = this.props.rule
    const state = this.state

    let result

    if (state.editing) {
      result = (
        <tr>
          <td>{rule.id}</td>
          <td>
            <input id="url" type="text" list="datalist-url"
              valueLink={this.linkState('rule.url')}
            />
            <datalist id="datalist-url">
              <option value="*" />
            </datalist>
          </td>
          <td>
            <input id="find" type="text"
              valueLink={this.linkState('rule.find')}
            />
          </td>
          <td>
            <input id="replace" type="text"
              valueLink={this.linkState('rule.replace')}
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
    } else {
      result = (
        <tr>
          <td>{rule.id}</td>
          <td>{rule.url}</td>
          <td>{rule.find}</td>
          <td>{rule.replace}</td>
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

    return result
  }
}
