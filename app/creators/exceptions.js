import * as types from '../actions/ActionTypes'

export function importExceptions(exceptions) {
  return { type: types.IMPORT_EXCEPTIONS, exceptions }
}
