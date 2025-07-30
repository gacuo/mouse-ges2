/**
 * バックグラウンド処理
 */

// コンテンツスクリプトからのメッセージを処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // メッセージのアクションに基づいて処理を実行
  switch (message.action) {
    case 'closeTab':
      // 現在のタブを閉じる
      chrome.tabs.remove(sender.tab.id, () => {
        // エラー処理
        if (chrome.runtime.lastError) {
          console.error('タブを閉じる際にエラーが発生しました:', chrome.runtime.lastError);
        }
      });
      break;
    
    default:
      console.log('未知のアクション:', message.action);
      break;
  }
  
  // 応答を返す（必要な場合）
  sendResponse({ success: true });
  
  // 非同期応答を許可するために true を返す
  return true;
});