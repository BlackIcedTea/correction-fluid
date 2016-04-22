import * as ActionTypes from '../actions/ActionTypes'

let initialState = []

const actionsMap = {
  [ActionTypes.ADD_RULE](state, action) {
    return [...state, {
      id: state.reduce((maxId, rule) => Math.max(rule.id, maxId), -1) + 1,
      name: action.name,
      url: action.url,
      find: action.find,
      replace: action.replace,
      selector: action.selector,
      isEnabled: true
    }]
  },
  [ActionTypes.DELETE_RULE](state, action) {
    return state.filter(rule => rule.id !== action.id)
  },
  [ActionTypes.EDIT_RULE](state, action) {
    return state.map(rule => {
      if (rule.id === action.id) {
        return Object.assign({}, rule, {
          name: action.name,
          url: action.url,
          find: action.find,
          replace: action.replace,
          selector: action.selector
        })
      }
      return rule
    })
  },
  [ActionTypes.ENABLE_RULE](state, action) {
    return state.map(rule => {
      if (rule.id === action.id) {
        return Object.assign({}, rule, {
          isEnabled: true
        })
      }
      return rule
    })
  },
  [ActionTypes.DISABLE_RULE](state, action) {
    return state.map(rule => {
      if (rule.id === action.id) {
        return Object.assign({}, rule, {
          isEnabled: false
        })
      }
      return rule
    })
  },
  [ActionTypes.CLEAR_RULES](state, action) {
    return []
  },
  [ActionTypes.IMPORT_RULES](state, action) {
    return action.rules.map((rule, index) => Object.assign(rule, {
      id: index + 1,
      isEnabled: true
    }))
  },
  [ActionTypes.APPEND_RULES](state, action) {
    return [...state,
      ...action.rules.map(rule => Object.assign(rule, {
        id: state.reduce((maxId, rule) => Math.max(rule.id, maxId), -1) + 1,
        isEnabled: true
      }))
    ]
  }
}

export default function rules(state = initialState, action) {
  const reduceFn = actionsMap[action.type]
  if (!reduceFn) return state
  return reduceFn(state, action)
}
