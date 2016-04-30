import { combineReducers } from 'redux'
import rules from './rules'
import exceptions from './exceptions'
export default combineReducers({
  rules,
  exceptions
})
