import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import RuleCreator from '../components/RuleCreator'
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
        <RuleCreator rules={rules} creators={creators} />
      </div>
    )
  }
}
