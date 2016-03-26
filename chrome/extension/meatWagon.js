import _ from 'lodash'
import R from 'ramda'
import xRegExp from 'xregexp'
import createStore from '../../app/store/configureStore'

const denyNodes = ['style'].map(x => x.toUpperCase())

let fixOverflowVisible = ([clientValue, scrollValue, offsetValue, style]) => {
  if ((clientValue === 0 && scrollValue === 0 && offsetValue > 0)
  || (style && style.display === 'inline')) {
    return offsetValue
  }
  return scrollValue / clientValue > 2 ? scrollValue : clientValue
}
let getHeight = R.compose(fixOverflowVisible, e =>
  [e.clientHeight, e.scrollHeight, e.offsetHeight,
    _.isElement(e) ? window.getComputedStyle(e) : null])
let getWidth = R.compose(fixOverflowVisible, e =>
  [e.clientWidth, e.scrollWidth, e.offsetWidth,
    _.isElement(e) ? window.getComputedStyle(e) : null])
let getWindowHeight = () => document.documentElement.clientHeight
let getWindowWidth = () => document.documentElement.clientWidth
let getScrollX = () => window.scrollX
let getScrollY = () => window.scrollY
let getX = e => e.offsetLeft
let getY = e => e.offsetTop
let getRelativeX = e => getX(e) - getScrollX()
let getRelativeY = e => getY(e) - getScrollY()
let getVisiblePart = R.curry((partFunc, windowPartFunc, relativePointFunc, e) => {
  let part = partFunc(e)
  let wPart = windowPartFunc()
  let begin = relativePointFunc(e)
  let end = begin + part
  if (begin > wPart || end < 0) {return 0}
  if (begin < 0) {begin = 0}
  if (end > wPart) {end = wPart}
  return end - begin
})
let getVisibleHeight = getVisiblePart(getHeight, getWindowHeight, getRelativeY)
let getVisibleWidth = getVisiblePart(getWidth, getWindowWidth, getRelativeX)
let getVisibleArea = e => getVisibleHeight(e) * getVisibleWidth(e)

function replaceCorpse({ find, replace }, node) {
  node.textContent = xRegExp.replace(node.textContent, find, replace)
}

function denyNodesFilter(denyNodeList) {
  return ({ parentNode: { nodeName } }) => !denyNodeList.includes(nodeName)
}

function getAllTextNodes(node) {
  if (getVisibleArea(node) <= 0) {
    return []
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return node
  }
  return _.flatMap(node.childNodes, getAllTextNodes)
}

function getAllTextNodesWithInvisible(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node
  }
  return _.flatMap(node.childNodes, getAllTextNodes)
}

function getAllTextNodesWithoutDenyNodes(node, denyNodeList) {
  return getAllTextNodes(node).filter(denyNodesFilter(denyNodeList))
}

function getAllTextNodesDenyNodes(node, denyNodeList) {
  return getAllTextNodesWithInvisible(node)
    .filter(denyNodesFilter(denyNodeList))
    .filter(x => getVisibleArea(x) > 0)
}

let getTextNodesWithoutDenyNodes = _.curryRight(getAllTextNodesWithoutDenyNodes)

let getTextNodesDenyNodes = _.curryRight(getAllTextNodesDenyNodes)

let queryTextNodes = (node, selector) => {
  if ((node.matches && !node.matches(selector))
  || getVisibleArea(node) <= 0) {
    return []
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return node
  }
  return _.flatMap(node.childNodes, x => queryTextNodes(x, selector))
}

let queryTextNodes2 = (node, selector) => {
  if (node.matches && !node.matches(selector)) {
    return []
  }
  if (node.nodeType === Node.TEXT_NODE && getVisibleArea(node.parentNode) >= 0) {
    return node
  }
  return _.flatMap(node.childNodes, x => queryTextNodes2(x, selector))
}

let queryTextNodesWithFilter = (node, selector, filter) =>
  queryTextNodes(node, selector).filter(filter)

let queryTextNodesWithFilter2 = (node, selector, filter) =>
  queryTextNodes2(node, selector).filter(filter)

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

  /*
  console.time('getAllTextNodesWithoutDenyNodes')
  _.each(rulesGroupBySelector, (rules, selector) => {
    let parentNodes = document.querySelectorAll(selector)
    _(parentNodes)
    .flatMap(parentNode => getAllTextNodesWithoutDenyNodes(parentNode, denyNodes))
    .each(node =>
      _.each(rules, rule => replaceCorpse(rule, node)))
  })
  console.timeEnd('getAllTextNodesWithoutDenyNodes')
  */

  /*
  console.time('queryTextNodesWithFilter2')
  _.each(rulesGroupBySelector, (rules, selector) => {
    _(queryTextNodesWithFilter2(document, selector, denyNodesFilter(denyNodes)))
      .each(node =>
        _.each(rules, rule => replaceCorpse(rule, node)))
  })
  console.timeEnd('queryTextNodesWithFilter2')
  */

  console.time('getTextNodesDenyNodes')
  _.each(rulesGroupBySelector, (rules, selector) => {
    let parentNodes = document.querySelectorAll(selector)
    _(parentNodes)
    .flatMap(parentNode => getTextNodesDenyNodes(parentNode, denyNodes))
    .each(node =>
      _.each(rules, rule => replaceCorpse(rule, node)))
  })
  console.timeEnd('getTextNodesDenyNodes')

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
