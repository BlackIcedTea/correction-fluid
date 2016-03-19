import React, { Component, PropTypes } from 'react'
import LinkedStateMixin from 'react-addons-linked-state-mixin'
import { decorate as mixin } from 'react-mixin'
import pure from 'purecss'
import classNames from 'classnames'

@mixin(LinkedStateMixin)
export default class RuleCreator extends Component {
  static propTypes = {
    rule: PropTypes.object.isRequired
  }

  render() {
    const rule = this.props.rule
    return (
      <tr>
        <td>{rule.id}</td>
        <td>{rule.url}</td>
        <td>{rule.find}</td>
        <td>{rule.replace}</td>
        <td>
          <input type="checkbox" checked={rule.isEnabled} />
        </td>
      </tr>
    )
  }
}
