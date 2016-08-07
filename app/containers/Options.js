import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import RuleTool from '../components/RuleTool'
import RuleCreator from '../components/RuleCreator'
import RuleList from '../components/RuleList'
import RuleEditor from '../components/RuleEditor'
import ExceptionEditor from '../components/ExceptionEditor'
import * as RulesCreator from '../creators/rules'
import * as ExceptionsCreator from '../creators/exceptions'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

@connect(
  state => ({
    rules: state.rules,
    exceptions: state.exceptions
  }),
  dispatch => ({
    ruleCreators: bindActionCreators(RulesCreator, dispatch),
    exceptionCreators: bindActionCreators(ExceptionsCreator, dispatch)
  })
)
export default class App extends Component {

  static propTypes = {
    exceptions: PropTypes.array.isRequired,
    rules: PropTypes.array.isRequired,
    ruleCreators: PropTypes.object.isRequired,
    exceptionCreators: PropTypes.object.isRequired
  }

  render() {
    const { rules, ruleCreators, exceptions, exceptionCreators } = this.props

    return (
      <div>
        <h2>Rules</h2>
        <Tabs>
          <TabList>
            <Tab>UI</Tab>
            <Tab>Source</Tab>
          </TabList>
          <TabPanel>
            <RuleList rules={rules} creators={ruleCreators} />
          </TabPanel>
          <TabPanel>
            <RuleEditor rules={rules} creators={ruleCreators} />
          </TabPanel>
        </Tabs>
        <h2>Rules Control</h2>
        <RuleTool rules={rules} creators={ruleCreators} />
        <h2>Exceptions(RegExp match URL, need restart extension to apply)</h2>
        <ExceptionEditor exceptions={exceptions} creators={exceptionCreators} />
      </div>
    )
  }
}
