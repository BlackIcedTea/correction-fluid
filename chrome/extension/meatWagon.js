import _ from 'lodash'
import xRegExp from 'xregexp'
import createStore from '../../app/store/configureStore'

function getAllTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node
  }
  return _.flatMap(node.childNodes, getAllTextNodes)
}

chrome.storage.local.get('state', obj => {
  const initialState = JSON.parse(obj.state || '{}')
  let state = createStore(initialState).getState()
  let rules = state.rules.filter(rule => xRegExp(rule.url).test(document.URL))
  getAllTextNodes(document).forEach(node => {
    let textNode = node
    rules.forEach(rule => {
      let find = xRegExp(rule.find)
      let replace = rule.replace
      textNode.textContent = xRegExp.replace(textNode.textContent, find, replace)
    })
  })
})
