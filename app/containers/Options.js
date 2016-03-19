import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import RuleTool from '../components/RuleTool'
import RuleCreator from '../components/RuleCreator'
import RuleList from '../components/RuleList'
import * as ActionCreator from '../creators/rules'

@connect(
  state => ({
    rules: state.rules
  }),
  dispatch => ({
    creators: bindActionCreators(ActionCreator, dispatch)
  })
)
export default class App extends Component {

  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  render() {
    const { rules, creators } = this.props

    return (
      <div>
        <RuleList rules={rules} creators={creators} />
        <RuleTool rules={rules} creators={creators} />
        <RuleCreator rules={rules} creators={creators} />
      </div>
    )
  }
}
