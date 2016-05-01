import React, { Component, PropTypes } from 'react'
import pure from 'purecss'
import classNames from 'classnames'
import RuleItem from './RuleItem'
import yaml from 'js-yaml'
import Alert from 'react-s-alert'

export default class RuleList extends Component {
  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  handleClear = event => {
    const { clearRules } = this.props.creators
    clearRules()
  }

  handleImport = event => this.refs.importFileChooser.click()

  handleAppend = event => this.refs.appendFileChooser.click()

  handleFileChoose = (creatorName, refName) =>
    event => {
      const creator = this.props.creators[creatorName]
      Array.from(this.refs[refName].files).forEach(file => {
        let reader = new FileReader()
        reader.onload = evt => {
          try {
            let newRules = yaml.safeLoad(evt.target.result)
            console.log(newRules)
            creator(newRules)
          } catch (e) {
            Alert.error(e.message)
          }
          this.refs[refName].value = ''
        }
        reader.readAsText(file)
      })
    }

  handleExport = event => {
    let blob = new Blob([yaml.safeDump(this.props.rules.map(rule => {
      let newRule = Object.assign({}, rule)
      if (newRule.hasOwnProperty('name') && newRule.name.trim() === '') {
        delete newRule.name
      }
      if (newRule.hasOwnProperty('selector') && newRule.selector.trim() === '*') {
        delete newRule.selector
      }
      if (newRule.hasOwnProperty('url') && newRule.url.trim() === 'http') {
        delete newRule.url
      }
      delete newRule.id
      delete newRule.isEnabled
      return newRule
    }))], { type: 'application/x-yaml' })
    let link = this.refs.downloader
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(blob)
  }

  render() {
    return (
      <div>
        <Alert />
        <button className={pure['pure-button']} onClick={this.handleClear}>Clear All</button>
        <input
          ref="importFileChooser" type="file" multiple accept=".yaml"
          style={{ display: 'none' }}
          onChange={this.handleFileChoose('importRules', 'importFileChooser')}
        />
        <input
          ref="appendFileChooser" type="file" multiple accept=".yaml"
          style={{ display: 'none' }}
          onChange={this.handleFileChoose('appendRules', 'appendFileChooser')}
        />
        <button className={pure['pure-button']} onClick={this.handleImport}>
        Import File
        </button>
        <button className={pure['pure-button']} onClick={this.handleAppend}>
        Append File
        </button>
        <a ref="downloader" download="rules.yaml" style={{ display: 'none' }} />
        <button className={pure['pure-button']} onClick={this.handleExport}>Export File</button>
      </div>
    )
  }
}
