import React, { Component } from 'react'
import pure from 'purecss'
import classNames from 'classnames'

export default class RuleCreator extends Component {
  render() {
    return (
      <form className={classNames(pure['pure-form'], pure['pure-form-stacked'])}>
        <fieldset>
          <legend>Create a rule</legend>
          <label htmlFor="url">When tab URL matched</label>
          <input id="url" type="text" list="datalist-url" />
          <datalist id="datalist-url">
            <option value="*" />
          </datalist>
          <label htmlFor="find">Find All</label>
          <input id="find" type="text" />
          <label htmlFor="replace">Replace To</label>
          <input id="replace" type="text" />
          <button
            className={classNames(pure['pure-button'], pure['pure-button-primary'])}
            type="submit"
          >
            Okay
          </button>
        </fieldset>
      </form>
    )
  }
}
