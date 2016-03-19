import React, { Component, PropTypes } from 'react'
import LinkedStateMixin from 'react-addons-linked-state-mixin'
import { decorate as mixin } from 'react-mixin'
import pure from 'purecss'
import classNames from 'classnames'
import RuleItem from './RuleItem'

@mixin(LinkedStateMixin)
export default class RuleList extends Component {
  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  render() {
    return (
      <table className={classNames(
        pure['pure-table'],
        pure['pure-table-bordered'],
        pure['pure-table-striped']
        )}
      >
        <thead>
          <tr>
            <th>Id</th>
            <th>URL</th>
            <th>Find</th>
            <th>Replace</th>
            <th>Enable</th>
          </tr>
        </thead>
        <tbody>
          {this.props.rules.map(rule => <RuleItem rule={rule} />)}
        </tbody>
      </table>
    )
  }
}
