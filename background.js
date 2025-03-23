chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'UPDATE_SPEED') {
        
        const tabId = sender.tab ? sender.tab.id : null;
        if (tabId) {
            const speedText = request.speed.toString();
            chrome.action.setBadgeText({ text: speedText, tabId: tabId});
            chrome.action.setBadgeBackgroundColor({ color: [0, 128, 0, 255] });
        }
       
    }
});