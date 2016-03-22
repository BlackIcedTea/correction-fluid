import cssPath from './cssPath'

let target = null

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'selector':
      sendResponse(cssPath(target, false))
      break
    default:
  }
})

document.addEventListener('contextmenu', event => {
  target = event.target
})
