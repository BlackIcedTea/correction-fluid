import _ from 'lodash'
import xRegExp from 'xregexp'
import createStore from '../../app/store/configureStore'

const denyNodes = ['style'].map(x => x.toUpperCase())

function replaceCorpse(rule, node) {
  let find = xRegExp(rule.find, 'ig')
  let replace = rule.replace
  node.textContent = xRegExp.replace(node.textContent, find, replace)
  console.log(rule, node)
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

function getTextNodesWithoutDenyNodes(denyNodeList) {
  return node => getAllTextNodes(node).filter(denyNodesFilter(denyNodeList))
}

chrome.storage.local.get('state', obj => {
  const initialState = JSON.parse(obj.state || '{}')
  let state = createStore(initialState).getState()
  let rules = _.groupBy(state.rules.filter(rule =>
    xRegExp(rule.url).test(document.URL) && rule.isEnabled)
  , 'selector')

  console.log(rules)

  console.log(getTextNodesWithoutDenyNodes(denyNodes)(document).length)

  /*
  rules.forEach(rule =>
    console.log(_(document.querySelectorAll(rule.selector))
      .flatMap(getTextNodesWithoutDenyNodes(denyNodes))
      .uniq().value().length)
    //  .each(node => replaceCorpse(rule, node))
  )
  */

  new MutationObserver(mutations => {
    /*
    function characterData({ target }) {
      rules.forEach(rule => {
        _(document.querySelectorAll(rule.selector))
          .flatMap(getTextNodesWithoutDenyNodes(denyNodes))
          .uniq()
          .each(node => replaceCorpse(rule, node))
      })
    }

    function childList({ target }) {
      rules.forEach(rule => {
        _(document.querySelectorAll(rule.selector))
        _(getTextNodesWithoutDenyNodes(denyNodes)(target))
          .flatMap(getTextNodesWithoutDenyNodes(denyNodes))
          .uniq()
          .each(node => replaceCorpse(rule, node))
      })
    }
    */

    // _.each(mutations, mutation => ({ characterData, childList })[mutation.type](mutation))
  })
  .observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true
  })
})
