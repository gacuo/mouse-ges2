/**
 * マウスジェスチャー検出機能
 */

// ジェスチャーの状態を管理
const gestureState = {
  isTracking: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  points: [],
  directions: [],
  minDistance: 20, // 方向変化を検出する最小ピクセル距離
  lastDirection: null
};

// ジェスチャーの方向定義
const DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

// ジェスチャーパターンの定義
const GESTURE_PATTERNS = {
  'DOWN,RIGHT': 'closeTab',   // ↓→: タブを閉じる
  'DOWN,LEFT': 'goBack',      // ↓←: 戻る
  'UP,RIGHT': 'goForward',    // ↑→: 進む
  'UP,LEFT': 'reloadTab'      // ↑←: 更新
};

// マウスの右クリックが押された時の処理
function handleMouseDown(event) {
  // 右クリックのみ検出 (button=2はブラウザでは右クリック)
  if (event.button === 2) {
    event.preventDefault(); // 右クリックメニューを無効化

    // ジェスチャー検出開始
    gestureState.isTracking = true;
    gestureState.startX = event.clientX;
    gestureState.startY = event.clientY;
    gestureState.currentX = event.clientX;
    gestureState.currentY = event.clientY;
    gestureState.points = [{ x: event.clientX, y: event.clientY }];
    gestureState.directions = [];
    gestureState.lastDirection = null;

    // カスタムイベントを発火して、航跡表示を開始
    document.dispatchEvent(new CustomEvent('gesture-start', {
      detail: { x: event.clientX, y: event.clientY }
    }));
  }
}

// マウスが移動した時の処理
function handleMouseMove(event) {
  if (!gestureState.isTracking) return;
  
  gestureState.currentX = event.clientX;
  gestureState.currentY = event.clientY;
  
  // 航跡用にポイントを追加
  gestureState.points.push({ x: event.clientX, y: event.clientY });
  
  // カスタムイベントを発火して、航跡を更新
  document.dispatchEvent(new CustomEvent('gesture-move', {
    detail: { x: event.clientX, y: event.clientY }
  }));
  
  // 方向検出
  detectDirection(event.clientX, event.clientY);
}

// マウスボタンが離された時の処理
function handleMouseUp(event) {
  // 右クリックのみ検出
  if (event.button === 2 && gestureState.isTracking) {
    gestureState.isTracking = false;
    
    // カスタムイベントを発火して、航跡を終了
    document.dispatchEvent(new CustomEvent('gesture-end'));
    
    // ジェスチャーを実行
    executeGesture();
    
    // 状態をリセット
    gestureState.points = [];
    gestureState.directions = [];
    gestureState.lastDirection = null;
  }
}

// マウスの動きから方向を検出する
function detectDirection(x, y) {
  const dx = x - gestureState.startX;
  const dy = y - gestureState.startY;
  
  // 閾値以上の動きがあるか確認
  if (Math.abs(dx) < gestureState.minDistance && Math.abs(dy) < gestureState.minDistance) return;
  
  // 方向を判定
  let direction;
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平方向の動きの方が大きい
    direction = dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
  } else {
    // 垂直方向の動きの方が大きい
    direction = dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
  }
  
  // 前回と違う方向の場合のみ追加
  if (direction !== gestureState.lastDirection) {
    gestureState.directions.push(direction);
    gestureState.lastDirection = direction;
    
    // 新しい基準点を設定
    gestureState.startX = x;
    gestureState.startY = y;
    
    // 方向が変わったことを通知
    document.dispatchEvent(new CustomEvent('gesture-direction-changed', {
      detail: { directions: gestureState.directions.slice() }
    }));
  }
}

// 認識されたジェスチャーを実行
function executeGesture() {
  if (gestureState.directions.length < 2) return; // 単一方向は無視
  
  // 最初の2つの方向を使ってパターンを識別
  const pattern = gestureState.directions.slice(0, 2).join(',');
  const action = GESTURE_PATTERNS[pattern];
  
  if (action) {
    // カスタムイベントを発火して、タブアクションを実行
    document.dispatchEvent(new CustomEvent('execute-tab-action', {
      detail: { action: action }
    }));
  }
}

// コンテキストメニューを無効化
function disableContextMenu(event) {
  // ジェスチャー検出中はコンテキストメニューを表示しない
  if (gestureState.isTracking || gestureState.points.length > 1) {
    event.preventDefault();
    return false;
  }
  return true;
}

// イベントリスナーを設定
document.addEventListener('mousedown', handleMouseDown, false);
document.addEventListener('mousemove', handleMouseMove, false);
document.addEventListener('mouseup', handleMouseUp, false);
document.addEventListener('contextmenu', disableContextMenu, false);

// ページを離れる時のクリーンアップ
window.addEventListener('unload', () => {
  document.removeEventListener('mousedown', handleMouseDown);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('contextmenu', disableContextMenu);
});