import * as types from '../actions/ActionTypes'

export function addRule(url, find, replace) {
  return { type: types.ADD_RULE, url, find, replace }
}

export function deleteRule(id) {
  return { type: types.DELETE_RULE, id }
}

export function editTodo(id, url, find, replace) {
  return { type: types.EDIT_RULE, url, find, replace }
}

export function enableRule(id) {
  return { type: types.ENABLE_RULE, id }
}

export function disableRule(id) {
  return { type: types.DISABLE_RULE, id }
}
