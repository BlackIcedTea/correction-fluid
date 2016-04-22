import React, { Component, PropTypes } from 'react'
import pure from 'purecss'
import classNames from 'classnames'
import RuleItem from './RuleItem'
import RuleInlineCreator from './RuleInlineCreator'

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
            <th>Name</th>
            <th>URL</th>
            <th>Find</th>
            <th>Replace</th>
            <th>Selector</th>
            <th>Enable</th>
            <th>Other</th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.rules.map(rule =>
              <RuleItem rule={rule} creators={this.props.creators} key={rule.id} />)
          }
          <RuleInlineCreator rules={this.props.rules} creators={this.props.creators} />
        </tbody>
      </table>
    )
  }
}
