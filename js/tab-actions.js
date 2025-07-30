/**
 * タブ操作機能
 */

// タブアクションを実行する
function executeTabAction(event) {
  const { action } = event.detail;
  
  switch (action) {
    case 'closeTab':
      closeCurrentTab();
      break;
    case 'goBack':
      navigateBack();
      break;
    case 'goForward':
      navigateForward();
      break;
    case 'reloadTab':
      reloadCurrentTab();
      break;
    default:
      console.log('未知のアクション:', action);
      break;
  }
}

// 現在のタブを閉じる
function closeCurrentTab() {
  // Chrome拡張機能の権限を使用してタブを閉じる
  chrome.runtime.sendMessage({ action: 'closeTab' });
  
  // 通知を表示（開発中のフィードバック用）
  showNotification('タブを閉じました');
}

// 戻る
function navigateBack() {
  window.history.back();
  
  // 通知を表示
  showNotification('前のページに戻りました');
}

// 進む
function navigateForward() {
  window.history.forward();
  
  // 通知を表示
  showNotification('次のページに進みました');
}

// タブを更新（リロード）
function reloadCurrentTab() {
  window.location.reload();
  
  // 通知を表示
  showNotification('ページを更新しました');
}

// 通知を表示（一時的なフィードバック）
function showNotification(message) {
  // 通知要素が既に存在する場合は削除
  const existingNotification = document.getElementById('gesture-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }
  
  // 通知要素を作成
  const notification = document.createElement('div');
  notification.id = 'gesture-notification';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10000';
  notification.textContent = message;
  
  // 通知を表示
  document.body.appendChild(notification);
  
  // 一定時間後に通知を消す
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }
  }, 2000);
}

// バックグラウンドスクリプトからの応答を処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'actionCompleted') {
    console.log('アクション完了:', message.action);
  }
});

// タブアクションの実行イベントをリッスン
document.addEventListener('execute-tab-action', executeTabAction);

// ページを離れる時のクリーンアップ
window.addEventListener('unload', () => {
  document.removeEventListener('execute-tab-action', executeTabAction);
});