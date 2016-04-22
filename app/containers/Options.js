import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import RuleTool from '../components/RuleTool'
import RuleCreator from '../components/RuleCreator'
import RuleList from '../components/RuleList'
import RuleEditor from '../components/RuleEditor'
import * as ActionCreator from '../creators/rules'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

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
        <Tabs>
          <TabList>
            <Tab>UI</Tab>
            <Tab>Source</Tab>
          </TabList>
          <TabPanel>
            <RuleList rules={rules} creators={creators} />
          </TabPanel>
          <TabPanel>
            <RuleEditor rules={rules} creators={creators} />
          </TabPanel>
        </Tabs>
        <RuleTool rules={rules} creators={creators} />
      </div>
    )
  }
}
