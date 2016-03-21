let target = null

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'selector':
      sendResponse(target.innerHTML)
      break
    default:
  }
})

document.addEventListener('contextmenu', event => {
  target = event.target
})
