import React, { Component, PropTypes } from 'react'
import _ from 'lodash'
import update from 'react-addons-update'
import pure from 'purecss'
import classNames from 'classnames'

export default class RuleCreator extends Component {
  static propTypes = {
    rules: PropTypes.array.isRequired,
    creators: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      rule: {
        name: '',
        url: 'http',
        find: '',
        replace: '',
        selector: ''
      },
      tips: ''
    }
  }

  linkState = (stateField) => {
    let fields = stateField.split('.')
    let nextState = {}
    return e => {
      _.reduce(fields, (state, field, i) => {
        if (!state[field]) {
          if (i !== _.findLastIndex(fields)) {
            state[field] = {}
          } else {
            state[field] = {
              $set: (type => {
                if (['checkbox', 'radio'].includes(type)) {
                  return e.target.checked
                }
                return e.target.value
              })(e.target.type)
            }
          }
        }
        return state[field]
      }, nextState)
      this.setState(update(this.state, nextState))
    }
  }

  handleAdd = (event) => {
    event.preventDefault()
    const { addRule } = this.props.creators
    addRule(this.state.rule)
    this.setState(update(this.state, {
      rule: {
        $set: {
          name: '',
          url: 'http',
          find: '',
          replace: '',
          selector: ''
        }
      },
      tips: {
        $set: 'Success!'
      }
    }))
    setTimeout(() => {
      this.setState(update(this.state), {
        tips: {
          $set: ''
        }
      })
    }, 3000)
  }

  render() {
    return (
      <form
        className={classNames(pure['pure-form'], pure['pure-form-stacked'])}
        onSubmit={this.handleAdd}
      >
        <fieldset>
          <legend>Create a rule</legend>
          <label htmlFor="name">Name(Optional)</label>
          <input
            id="name" type="text" value={this.state.rule.name}
            onChange={this.linkState('rule.name')}
          />
          <label htmlFor="url">When tab URL matched</label>
          <input
            id="url" type="text" list="datalist-url" value={this.state.rule.url}
            required
            onChange={this.linkState('rule.url')}
          />
          <datalist id="datalist-url">
            <option value="*" />
          </datalist>
          <label htmlFor="find">Find All</label>
          <input
            id="find" type="text" value={this.state.rule.find}
            required
            onChange={this.linkState('rule.find')}
          />
          <label htmlFor="replace">Replace To</label>
          <input
            id="replace" type="text" value={this.state.rule.replace}
            required
            onChange={this.linkState('rule.replace')}
          />
          <label htmlFor="selector">CSS Selector(Optional)</label>
          <input
            id="selector" type="text" value={this.state.rule.selector}
            onChange={this.linkState('rule.selector')}
          />
          <input
            type="submit"
            className={classNames(pure['pure-button'], pure['pure-button-primary'])}
            value="Okay"
          />
          <span>{this.state.tips}</span>
        </fieldset>
      </form>
    )
  }
}
