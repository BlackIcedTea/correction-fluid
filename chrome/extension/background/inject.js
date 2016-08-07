import _ from 'lodash'
import xRegExp from 'xregexp'
import createStore from '../../../app/store/configureStore'

let state = { rules: [] }

function loadScript(name, tabId, cb) {
  if (process.env.NODE_ENV === 'production') {
    chrome.tabs.executeScript(tabId, { file: `/js/${name}.bundle.js`, runAt: 'document_end' }, cb)
  } else {
    fetch(`https://localhost:3000/js/${name}.bundle.js`)
    .then(res => res.text())
    .then(fetchRes => {
      // Load redux-devtools-extension inject bundle,
      // because inject script and page is in a different context
      const request = new XMLHttpRequest()
      request.open('GET', 'chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/js/inject.bundle.js')  // sync
      request.send()
      request.onload = () => {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
          chrome.tabs.executeScript(tabId, { code: request.responseText, runAt: 'document_start' })
        }
      }
      chrome.tabs.executeScript(tabId, { code: fetchRes, runAt: 'document_end' }, cb)
    })
  }
}

function updateState() {
  chrome.storage.local.get('state', obj => {
    const initialState = JSON.parse(obj.state || '{}')
    state = createStore(initialState).getState()
  })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'loading') {
    return
  }

  if (!_.some(state.exceptions, exception => xRegExp(exception).test(tab.url))
    && _.some(state.rules, rule => xRegExp(rule.url).test(tab.url))) {
    loadScript('meatWagon', tabId, () => console.log(`${tab.url} meatWagon injected.`))
  }
})

updateState()
