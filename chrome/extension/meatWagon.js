import _ from 'lodash'
import R from 'ramda'
import xRegExp from 'xregexp'
import createStore from '../../app/store/configureStore'

const denyNodes = ['style'].map(x => x.toUpperCase())

function getVisibleArea(e) {
  let { left, top, right, bottom, width, height } = e.getBoundingClientRect()
  let { clientHeight, clientWidth } = document.documentElement
  let w = 0
  let h = 0
  if (top < clientHeight && left < clientWidth) {
    if (top > 0 && bottom > 0) {
      h = height
    } else if (top < 0 && bottom > 0) {
      h = height + top
    } else if (top > 0 && bottom < 0) {
      h = height + bottom
    }

    if (left > 0 && right > 0) {
      w = width
    } else if (left < 0 && right > 0) {
      w = width + left
    } else if (left > 0 && right < 0) {
      w = width + right
    }
  }
  return w * h
}

function replaceCorpse({ find, replace }, node) {
  node.textContent = xRegExp.replace(node.textContent, find, replace)
}

function denyNodesFilter(denyNodeList) {
  return ({ parentNode: { nodeName } }) => !denyNodeList.includes(nodeName)
}

let queryTextNodes = (node, selector) => {
  if (node.matches && !node.matches(selector)) {
    return []
  }
  if (node.nodeType === Node.TEXT_NODE && getVisibleArea(node.parentNode) > 0) {
    return node
  }
  return _.flatMap(node.childNodes, x => queryTextNodes(x, selector))
}

let queryTextNodesWithFilter = (node, selector, filter) =>
  queryTextNodes(node, selector).filter(filter)

chrome.storage.local.get('state', obj => {
  const initialState = JSON.parse(obj.state || '{}')
  let state = createStore(initialState).getState()
  let rulesGroupBySelector = _.groupBy(
    state.rules.filter(rule =>
      xRegExp(rule.url).test(document.URL) && rule.isEnabled
    ).map(rule =>
      Object.assign({}, rule, { find: xRegExp(rule.find, 'ig') })
    )
  , 'selector')

  /*
  console.time('queryTextNodesWithFilter')
  _.each(rulesGroupBySelector, (rules, selector) => {
    _(queryTextNodesWithFilter(document, selector, denyNodesFilter(denyNodes)))
      .each(node =>
        _.each(rules, rule => replaceCorpse(rule, node)))
  })
  console.timeEnd('queryTextNodesWithFilter')
  */

  console.time('treeWalker')
  _.each(rulesGroupBySelector, (rules, selector) => {
    let treeWalker = document.createTreeWalker(
      document,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (denyNodesFilter(denyNodes)(node.parentNode)
          && node.parentElement.matches(selector)
          && getVisibleArea(node.parentNode) > 0) {
            return NodeFilter.FILTER_ACCEPT
          }
          return NodeFilter.FILTER_REJECT
        }
      },
      false
    )
    while (treeWalker.nextNode()) {
      _.each(rules, rule => replaceCorpse(rule, treeWalker.currentNode))
    }
  })
  console.timeEnd('treeWalker')

  new MutationObserver(mutations => {
    function characterData({ target }) {

    }

    function childList({ target }) {

    }
    _.each(mutations, mutation => ({ characterData, childList })[mutation.type](mutation))
  })
  .observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true
  })
})
