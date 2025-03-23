// 从存储加载上次设置的速度
chrome.storage.local.get('speed', (data) => {
  if (typeof data.speed === 'undefined') {
    chrome.storage.local.set({ speed: 1 });
  }
  const speed = data.speed || 1;
  document.getElementById('speedRange').value = speed;
  document.getElementById('speedValue').textContent = `${speed}x`;
});

// 滑块变化事件处理
document.getElementById('speedRange').addEventListener('input', (e) => {
  const speed = parseFloat(e.target.value);
  document.getElementById('speedValue').textContent = `${speed}x`;
  
  // 保存设置并发送给content script
  chrome.storage.local.set({ speed });
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'SET_SPEED', speed});
  });
});