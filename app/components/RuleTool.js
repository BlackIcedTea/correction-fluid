import React, { Component, PropTypes } from 'react'
import pure from 'purecss'
import classNames from 'classnames'
import RuleItem from './RuleItem'

export default class RuleList extends Component {
  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  handleClear = event => {
    const { clearRules } = this.props.creators
    clearRules()
  }

  handleImport = event => this.refs.fileChooser.click()

  handleFileChoose = event => {
    const { importRules } = this.props.creators
    Array.from(this.refs.fileChooser.files).forEach(file => {
      let reader = new FileReader()
      reader.onload = evt => importRules(JSON.parse(evt.target.result))
      reader.readAsText(file)
    })
  }

  handleExport = event => {
    let blob = new Blob([JSON.stringify(this.props.rules, null, 2)], { type: 'application/json' })
    let link = this.refs.downloader
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(blob)
  }

  render() {
    return (
      <div>
        <button className={pure['pure-button']} onClick={this.handleClear}>Clear All</button>
        <input ref="fileChooser" type="file" multiple accept=".json"
          style={{ display: 'none' }} onChange={this.handleFileChoose}
        />
        <button className={pure['pure-button']} onClick={this.handleImport}>
        Import File
        </button>
        <a ref="downloader" download="export.json" style={{ display: 'none' }} />
        <button className={pure['pure-button']} onClick={this.handleExport}>Export File</button>
      </div>
    )
  }
}
