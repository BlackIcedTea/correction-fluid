import _ from 'lodash'
import R from 'ramda'
import xRegExp from 'xregexp'
import createStore from '../../app/store/configureStore'

const denyNodes = ['script', 'style', 'input', 'textarea'].map(x => x.toUpperCase())

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
  node.isCorpsesReplaced = true
}

function denyNodesFilter(denyNodeList) {
  return ({ parentNode }) => parentNode && !denyNodeList.includes(parentNode.nodeName)
}

let queryTextNodes = (node, selector) => {
  if (node.isCorpsesReplaced
  || node.contenteditable
  || (node.matches && !node.matches(selector))) {
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

  let replaceAllCorpses = root => {
    let allNodes = []
    let treeWalker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.isCorpsesReplaced
          && !node.contenteditable
          && denyNodesFilter(denyNodes)(node)) {
            return NodeFilter.FILTER_ACCEPT
          }
          return NodeFilter.FILTER_REJECT
        }
      },
      false
    )
    while (treeWalker.nextNode()) {
      allNodes.push(treeWalker.currentNode)
    }
    _.each(rulesGroupBySelector, (rules, selector) => {
      _(allNodes)
      .filter(node => node.parentElement && node.parentElement.matches(selector))
      .each(node => _.each(rules, rule => replaceCorpse(rule, node)))
    })
  }

  let replaceVisibleCorpses = root => {
    let visibleNodes = []
    let treeWalker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.isCorpsesReplaced
          && !node.contenteditable
          && denyNodesFilter(denyNodes)(node)
          && getVisibleArea(node.parentNode) > 0) {
            return NodeFilter.FILTER_ACCEPT
          }
          return NodeFilter.FILTER_REJECT
        }
      },
      false
    )
    while (treeWalker.nextNode()) {
      visibleNodes.push(treeWalker.currentNode)
    }
    _.each(rulesGroupBySelector, (rules, selector) => {
      _(visibleNodes)
      .filter(node => node.parentElement && node.parentElement.matches(selector))
      .each(node => _.each(rules, rule => replaceCorpse(rule, node)))
    })
  }

  window.requestAnimationFrame(() => {
    console.time('treeWalker')
    replaceAllCorpses(document)
    console.timeEnd('treeWalker')
  })

  new MutationObserver(mutations => {
    function characterData(targets) {
      window.requestAnimationFrame(() => {
        console.time('characterData')
        _.each(targets, target => {
          _.each(rulesGroupBySelector, (rules, selector) => {
            if (denyNodesFilter(denyNodes)(target)
            && (
              (target.matches && target.matches(selector))
              || (target.parentElement
                && target.parentElement.matches
                && target.parentElement.matches(selector)))
            && !(target.contentEditable
              || (target.parentElement
                && target.parentElement.contentEditable))) {
              _.each(rules, rule => replaceCorpse(rule, target))
            }
          })
        })
        console.timeEnd('characterData')
      })
    }

    function childList(targets) {
      window.requestAnimationFrame(() => {
        console.time('childList')
        _.each(targets, target => replaceAllCorpses(target))
        console.timeEnd('childList')
      })
    }

    let mutationsGroup = _.groupBy(mutations, mutation => mutation.type)
    _.each(mutationsGroup, (mutations, type) =>
      ({ characterData, childList })[type](
        _(mutations).map(mutation => mutation.target).uniq().value()
      ))
  })
  .observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true
  })

  let ticking = false
})
