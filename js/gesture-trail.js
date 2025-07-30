/**
 * マウスの航跡表示機能
 */

// 航跡の設定
const trailSettings = {
  pointLifetime: 1000,  // 航跡のポイントの表示時間（ミリ秒）
  maxPoints: 100,      // 最大表示ポイント数
  pointSize: 4,        // ポイントのサイズ（ピクセル）
  pointColor: '#ff1493', // 鮮やかなピンク色
  trailPoints: []      // 航跡のポイント要素の配列
};

// 方向表示要素
let directionDisplay = null;

// 航跡開始時の処理
function handleGestureStart(event) {
  // 方向表示用の要素を作成
  if (!directionDisplay) {
    directionDisplay = document.createElement('div');
    directionDisplay.className = 'gesture-direction';
    document.body.appendChild(directionDisplay);
  }
  
  // 既存の航跡をクリア
  clearTrail();
}

// 航跡の更新処理
function handleGestureMove(event) {
  const { x, y } = event.detail;
  
  // 新しい航跡ポイントを作成
  const point = document.createElement('div');
  point.className = 'mouse-gesture-trail';
  point.style.left = `${x}px`;
  point.style.top = `${y}px`;
  point.style.backgroundColor = trailSettings.pointColor;
  point.style.width = `${trailSettings.pointSize}px`;
  point.style.height = `${trailSettings.pointSize}px`;
  
  document.body.appendChild(point);
  
  // 航跡ポイントを記録
  trailSettings.trailPoints.push({
    element: point,
    timestamp: Date.now()
  });
  
  // 一定時間後に航跡ポイントを消す
  setTimeout(() => {
    if (point.parentNode) {
      point.style.opacity = '0';
      setTimeout(() => {
        if (point.parentNode) {
          point.parentNode.removeChild(point);
        }
      }, 500); // フェードアウト時間
    }
  }, trailSettings.pointLifetime);
  
  // 最大ポイント数を超えたら古いポイントを削除
  if (trailSettings.trailPoints.length > trailSettings.maxPoints) {
    const oldestPoint = trailSettings.trailPoints.shift();
    if (oldestPoint.element.parentNode) {
      oldestPoint.element.parentNode.removeChild(oldestPoint.element);
    }
  }
}

// 方向変更の処理
function handleGestureDirectionChanged(event) {
  const { directions } = event.detail;
  
  if (directionDisplay) {
    // 方向を表示
    directionDisplay.textContent = directions.join(' → ');
    directionDisplay.style.display = 'block';
  }
}

// 航跡終了時の処理
function handleGestureEnd() {
  // 少し時間を置いてから航跡を消す
  setTimeout(clearTrail, 500);
  
  // 方向表示を消す
  if (directionDisplay) {
    setTimeout(() => {
      directionDisplay.style.display = 'none';
    }, 1000);
  }
}

// 航跡をクリア
function clearTrail() {
  // 全ての航跡ポイントを削除
  trailSettings.trailPoints.forEach(point => {
    if (point.element.parentNode) {
      point.element.parentNode.removeChild(point.element);
    }
  });
  
  // 配列をクリア
  trailSettings.trailPoints = [];
}

// イベントリスナーを設定
document.addEventListener('gesture-start', handleGestureStart);
document.addEventListener('gesture-move', handleGestureMove);
document.addEventListener('gesture-direction-changed', handleGestureDirectionChanged);
document.addEventListener('gesture-end', handleGestureEnd);

// ページを離れる時のクリーンアップ
window.addEventListener('unload', () => {
  document.removeEventListener('gesture-start', handleGestureStart);
  document.removeEventListener('gesture-move', handleGestureMove);
  document.removeEventListener('gesture-direction-changed', handleGestureDirectionChanged);
  document.removeEventListener('gesture-end', handleGestureEnd);
  
  clearTrail();
});