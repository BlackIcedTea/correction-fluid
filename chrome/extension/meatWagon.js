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
  node.isCorpsesReplaced = true
}

function denyNodesFilter(denyNodeList) {
  return ({ parentNode: { nodeName } }) => !denyNodeList.includes(nodeName)
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

  let replaceVisibleCorpses = root => {
    _.each(rulesGroupBySelector, (rules, selector) => {
      let treeWalker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.isCorpsesReplaced
            && !node.contenteditable
            && denyNodesFilter(denyNodes)(node.parentNode)
            && (node.parentElement && node.parentElement.matches(selector))
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
  }

  window.requestAnimationFrame(() => {
    console.time('treeWalker')
    replaceVisibleCorpses(document)
    console.timeEnd('treeWalker')
  })

  new MutationObserver(mutations => {
    function characterData(targets) {
      window.requestAnimationFrame(() => {
        console.time('characterData')
        _.each(targets, target => {
          _.each(rulesGroupBySelector, (rules, selector) => {
            if (((target.matches && target.matches(selector))
            || (target.parentElement
              && target.parentElement.matches
              && target.parentElement.matches(selector)))
            && !(target.contentEditable
              || (target.parentElement
                && target.parentElement.contentEditable))
              ) {
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
        let time = Date.now()
        // replaceVisibleCorpses(document)
        _.each(rulesGroupBySelector, (rules, selector) => {
          _(queryTextNodesWithFilter({ childNodes: targets }, selector, denyNodesFilter(denyNodes)))
            .uniq()
            .each(node =>
              _.each(rules, rule => replaceCorpse(rule, node)))
        })
        if (Date.now() - time > 500) {
          console.log(targets)
        }
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
  let throttleReplaceVisibleCorpses = _.throttle(replaceVisibleCorpses, 300)

  window.addEventListener('scroll', e => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        console.time('scroll')
        throttleReplaceVisibleCorpses(document)
        ticking = false
        console.timeEnd('scroll')
      })
    } else {
      ticking = true
    }
  }, true)
})
