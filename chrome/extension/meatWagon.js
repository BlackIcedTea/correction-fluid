import _ from 'lodash'
import xRegExp from 'xregexp'
import createStore from '../../app/store/configureStore'

const denyNodes = ['style'].map(x => x.toUpperCase())

function getAllTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE &&
    !denyNodes.includes(node.parentNode.nodeName)) {
    return node
  }
  return _.flatMap(node.childNodes, getAllTextNodes)
}

chrome.storage.local.get('state', obj => {
  const initialState = JSON.parse(obj.state || '{}')
  let state = createStore(initialState).getState()
  let rules = state.rules.filter(rule => xRegExp(rule.url).test(document.URL) && rule.isEnabled)
  getAllTextNodes(document).forEach(node => {
    rules.forEach(rule => {
      if (Array.from(document.querySelectorAll(rule.selector))
        .filter(parentNode => !['style'].map(x => x.toUpperCase()).includes(parentNode.nodeName))
        .some(parentNode => parentNode.contains(node))) {
        let find = xRegExp(rule.find, 'ig')
        let replace = rule.replace
        node.textContent = xRegExp.replace(node.textContent, find, replace)
      }
    })
  })
})
