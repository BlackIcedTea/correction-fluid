import ChromePromise from 'chrome-promise'

const chromePromise = new ChromePromise()

const CREATE_RULE_WITH_SELECTION = 'CREATE_RULE_WITH_SELECTION'

chrome.contextMenus.create({
  id: 'CREATE_RULE_WITH_SELECTION',
  title: 'Create rule with selection',
  contexts: ['selection']
})

chrome.contextMenus.onClicked.addListener(async ({ menuItemId, pageUrl, selectionText }, tab) => {
  if (menuItemId === CREATE_RULE_WITH_SELECTION) {
    let selector = await chromePromise.tabs.sendMessage(tab.id, { type: 'selector' })
  }
})
