import React, { Component, PropTypes } from 'react'
import pure from 'purecss'
import classNames from 'classnames'
import RuleItem from './RuleItem'
import yaml from 'js-yaml'

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

  handleFileChoose = creatorName =>
    event => {
      const creator = this.props.creators[creatorName]
      Array.from(this.refs.fileChooser.files).forEach(file => {
        let reader = new FileReader()
        reader.onload = evt => {
          creator(JSON.parse(evt.target.result))
          this.refs.fileChooser.value = ''
        }
        reader.readAsText(file)
      })
    }

  handleExport = event => {
    let blob = new Blob([yaml.safeDump(this.props.rules.map(rule => {
      delete rule.id
      delete rule.isEnabled
      return rule
    }))], { type: 'application/x-yaml' })
    let link = this.refs.downloader
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(blob)
  }

  render() {
    return (
      <div>
        <button className={pure['pure-button']} onClick={this.handleClear}>Clear All</button>
        <input ref="importFileChooser" type="file" multiple accept=".json"
          style={{ display: 'none' }} onChange={this.handleFileChoose('importRules')}
        />
        <input ref="appendFileChooser" type="file" multiple accept=".json"
          style={{ display: 'none' }} onChange={this.handleFileChoose('appendRules')}
        />
        <button className={pure['pure-button']} onClick={this.handleImport}>
        Import File
        </button>
        <button className={pure['pure-button']} onClick={this.handleAppend}>
        Append File
        </button>
        <a ref="downloader" download="export.json" style={{ display: 'none' }} />
        <button className={pure['pure-button']} onClick={this.handleExport}>Export File</button>
      </div>
    )
  }
}
