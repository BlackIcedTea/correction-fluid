import * as ActionTypes from '../actions/ActionTypes'

let initialState = []

const actionsMap = {
  [ActionTypes.IMPORT_EXCEPTIONS](state, action) {
    return action.exceptions.filter(x => !!x)
  }
}

export default function exceptions(state = initialState, action) {
  const reduceFn = actionsMap[action.type]
  if (!reduceFn) return state
  return reduceFn(state, action)
}
