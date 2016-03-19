import React, { Component, PropTypes } from 'react'
import LinkedStateMixin from 'react-addons-linked-state-mixin'
import { decorate as mixin } from 'react-mixin'
import pure from 'purecss'
import classNames from 'classnames'

@mixin(LinkedStateMixin)
export default class RuleCreator extends Component {
  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      url: '',
      find: '',
      replace: ''
    }
  }

  handleAdd = (event) => {
    console.log(this.props.creators)
    const { addRule } = this.props.creators
    const { url, find, replace } = this.state
    addRule(url, find, replace)
    event.preventDefault()
  }

  render() {
    return (
      <form className={classNames(pure['pure-form'], pure['pure-form-stacked'])}>
        <fieldset>
          <legend>Create a rule</legend>
          <label htmlFor="url">When tab URL matched</label>
          <input id="url" type="text" list="datalist-url" valueLink={this.linkState('url')} />
          <datalist id="datalist-url">
            <option value="*" />
          </datalist>
          <label htmlFor="find">Find All</label>
          <input id="find" type="text" valueLink={this.linkState('find')} />
          <label htmlFor="replace">Replace To</label>
          <input id="replace" type="text" valueLink={this.linkState('replace')} />
          <button
            className={classNames(pure['pure-button'], pure['pure-button-primary'])}
            onClick={this.handleAdd}
          >
            Okay
          </button>
        </fieldset>
      </form>
    )
  }
}
