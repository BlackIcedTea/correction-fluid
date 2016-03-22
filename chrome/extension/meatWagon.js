import _ from 'lodash'
import xRegExp from 'xregexp'
import createStore from '../../app/store/configureStore'

const denyNodes = ['style'].map(x => x.toUpperCase())

function replaceCorpse(rule, node) {
  let find = xRegExp(rule.find, 'ig')
  let replace = rule.replace
  node.textContent = xRegExp.replace(node.textContent, find, replace)
}

function getAllTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node
  }
  return _.flatMap(node.childNodes, getAllTextNodes)
}

function denyNodesFilter(denyNodeList) {
  return ({ parentNode: { nodeName } }) => !denyNodeList.includes(nodeName)
}

function getAllTextNodesWithoutDenyNodes(node, denyNodeList) {
  return getAllTextNodes(node).filter(denyNodesFilter(denyNodeList))
}

chrome.storage.local.get('state', obj => {
  const initialState = JSON.parse(obj.state || '{}')
  let state = createStore(initialState).getState()
  let rules = state.rules.filter(rule => xRegExp(rule.url).test(document.URL) && rule.isEnabled)
  getAllTextNodesWithoutDenyNodes(document).forEach(node =>
    rules.filter(rule =>
      _(document.querySelectorAll(rule.selector))
        .filter(denyNodesFilter(denyNodes))
        .value()
        .some(parentNode => parentNode.contains(node))
    ).forEach(rule => replaceCorpse(rule, node))
  )

  new MutationObserver(mutations => {
    function characterData({ target }) {
      let node = target
      rules.filter(rule =>
        _(document.querySelectorAll(rule.selector))
          .filter(denyNodesFilter(denyNodes))
          .value()
          .some(parentNode => parentNode.contains(node))
      ).forEach(rule => replaceCorpse(rule, node))
    }

    function childList({ target }) {
      getAllTextNodesWithoutDenyNodes(target).forEach(node =>
        rules.filter(rule =>
          _(document.querySelectorAll(rule.selector))
            .filter(denyNodesFilter(denyNodes))
            .value()
            .some(parentNode => parentNode.contains(node))
        ).forEach(rule => replaceCorpse(rule, node))
      )
    }

    _.each(mutations, mutation => ({ characterData, childList })[mutation.type](mutation))
  })
  .observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true
  })
})
