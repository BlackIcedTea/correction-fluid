import * as types from '../actions/ActionTypes'

export function addRule({ name, url, find, replace, selector }) {
  return { type: types.ADD_RULE, name, url, find, replace, selector: selector || '*' }
}

export function deleteRule(id) {
  return { type: types.DELETE_RULE, id }
}

export function editRule(id, { url, find, replace, selector }) {
  return { type: types.EDIT_RULE, id, name, url, find, replace, selector: selector || '*' }
}

export function enableRule(id) {
  return { type: types.ENABLE_RULE, id }
}

export function disableRule(id) {
  return { type: types.DISABLE_RULE, id }
}

export function clearRules() {
  return { type: types.CLEAR_RULES }
}

export function importRules() {
  return { type: types.IMPORT_RULES }
}
