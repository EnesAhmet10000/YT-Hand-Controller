/**
 * ============================================================================
 *  YouTube Hand Control — Offscreen Document (offscreen.js)
 * ============================================================================
 *  Offscreen Document API üzerinde çalışır.
 *  - Ayarlar background.js'den mesaj ile alınır (chrome.storage KULLANILMAZ)
 *  - MediaPipe Hands ile el algılar
 *  - Algılanan hareketleri background.js üzerinden content.js'e iletir
 *
 *  MİMARİ NOTLAR:
 *  1. requestAnimationFrame Offscreen'de ÇALIŞMAZ → setTimeout kullanılır
 *  2. chrome.storage Offscreen'de GÜVENİLMEZ → Ayarlar mesaj ile gelir
 *  3. Chrome Offscreen'i inaktif görüp KAPATIR → 10sn KEEP_ALIVE heartbeat
 * ============================================================================
 */

(() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  //  KEEP-ALIVE HEARTBEAT — Chrome'un Offscreen'i Öldürmesini Engelle
  // ═══════════════════════════════════════════════════════════════════════════

  setInterval(() => {
    try {
      if (chrome?.runtime?.id) {
        chrome.runtime.sendMessage({ type: 'KEEP_ALIVE' }, () => {
          if (chrome.runtime.lastError) { /* sessiz */ }
        });
      }
    } catch (e) { /* sessiz */ }
  }, 10000);

  console.log('[Offscreen] Keep-Alive aktif (10sn).');


  // ═══════════════════════════════════════════════════════════════════════════
  //  A. GESTURE RECOGNIZER — Saf Matematik
  // ═══════════════════════════════════════════════════════════════════════════

  const euclidean = (a, b) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);

  function isOpenPalm(lm) {
    return lm[8].y < lm[6].y && lm[12].y < lm[10].y &&
           lm[16].y < lm[14].y && lm[20].y < lm[18].y;
  }

  function isThumbsUp(lm) {
    const fourCurled = lm[8].y > lm[6].y && lm[12].y > lm[10].y &&
                       lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return fourCurled && lm[4].y < lm[3].y;
  }

  function isPeaceSign(lm) {
    const mainOpen = lm[8].y < lm[6].y && lm[12].y < lm[10].y;
    const othersClosed = lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return mainOpen && othersClosed;
  }

  function isFist(lm) {
    return lm[8].y > lm[6].y && lm[12].y > lm[10].y &&
           lm[16].y > lm[14].y && lm[20].y > lm[18].y;
  }

  function getPinchDistance(lm) {
    return euclidean(lm[4], lm[8]);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  B. GESTURE TABLE
  // ═══════════════════════════════════════════════════════════════════════════

  const GESTURE_TABLE = [
    { key: 'open_palm',  recognize: isOpenPalm,  icon: '✋', name: 'Open_Palm'  },
    { key: 'thumbs_up',  recognize: isThumbsUp,  icon: '👍', name: 'Thumbs_Up'  },
    { key: 'peace_sign', recognize: isPeaceSign, icon: '✌️', name: 'Peace_Sign' },
    { key: 'fist',       recognize: isFist,      icon: '✊', name: 'Fist'       },
  ];

  const PINCH_CONFIG = {
    key: 'pinch', icon: '🤏', name: 'Pinch_Volume',
    minDist: 0.02, maxDist: 0.28,
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //  C. SETTINGS — Hardcoded (chrome.storage KULLANILMAZ)
  // ═══════════════════════════════════════════════════════════════════════════

  const DEFAULT_SETTINGS = {
    open_palm:  { enabled: true, action: 'togglePlay'    },
    thumbs_up:  { enabled: true, action: 'speedUp'       },
    peace_sign: { enabled: true, action: 'toggleMute'    },
    fist:       { enabled: true, action: 'seekBackward'  },
    pinch:      { enabled: true, action: 'volumeControl' },
  };

  let gestureSettings = { ...DEFAULT_SETTINGS };


  // ═══════════════════════════════════════════════════════════════════════════
  //  D. DWELL TIME CONTROLLER — Midas Touch Koruması (600ms) + Cooldown
  // ═══════════════════════════════════════════════════════════════════════════

  const DWELL_MS = 600;
  let dwellState = { currentGesture: null, startTime: 0, fired: false };

  let lastActionTime = 0;
  const ACTION_COOLDOWN = 800; // 800ms throttling

  function handleDiscreteGesture(gesture, setting) {
    const now = performance.now();

    if (dwellState.currentGesture !== gesture.key) {
      dwellState.currentGesture = gesture.key;
      dwellState.startTime = now;
      dwellState.fired = false;
    }

    const elapsed  = now - dwellState.startTime;
    const progress = Math.min(elapsed / DWELL_MS, 1.0);

    sendMsg({
      type: 'GESTURE_DWELL',
      progress,
      icon: gesture.icon,
      gestureName: gesture.name,
    });

    if (progress >= 1.0 && !dwellState.fired) {
      if (now - lastActionTime < ACTION_COOLDOWN) return;

      dwellState.fired = true;
      lastActionTime = now;

      sendMsg({
        type: 'GESTURE_ACTION',
        action: setting.action,
        icon: gesture.icon,
        gestureName: gesture.name,
      });
    }
  }

  function resetDwell() {
    if (dwellState.currentGesture !== null) {
      dwellState.currentGesture = null;
      dwellState.startTime = 0;
      dwellState.fired = false;
      sendMsg({ type: 'GESTURE_RESET' });
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  E. CAMERA + MediaPipe Hands (setTimeout döngüsü)
  // ═══════════════════════════════════════════════════════════════════════════

  let cameraStream  = null;
  let handsInstance  = null;
  let cameraVideo   = null;
  let isRunning     = false;
  let frameTimer    = null;

  async function startCamera() {
    if (isRunning) return;
    console.log('[Offscreen] Kamera başlatılıyor...');

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      cameraVideo = document.getElementById('cameraVideo');
      cameraVideo.srcObject = cameraStream;
      await cameraVideo.play();

      /* global Hands */
      handsInstance = new Hands({
        locateFile: (file) => `lib/${file}`,
      });

      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        selfieMode: true,
      });

      handsInstance.onResults(onHandResults);

      isRunning = true;
      console.log('[Offscreen] Kamera + MediaPipe başlatıldı.');
      processFrame();

    } catch (err) {
      console.error('[Offscreen] Kamera hatası:', err);
    }
  }

  async function processFrame() {
    if (!isRunning || !handsInstance || !cameraVideo) return;

    try {
      await handsInstance.send({ image: cameraVideo });
    } catch (e) { /* sessiz */ }

    if (isRunning) {
      frameTimer = setTimeout(processFrame, 33); // ~30 FPS — orijinal çalışan hız
    }
  }

  function onHandResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      resetDwell();
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Pinch (Continuous)
    const pinchSetting = gestureSettings[PINCH_CONFIG.key];
    if (pinchSetting && pinchSetting.enabled) {
      const pinchDist = getPinchDistance(landmarks);
      if (pinchDist < PINCH_CONFIG.maxDist) {
        const { minDist, maxDist } = PINCH_CONFIG;
        const clamped = Math.max(minDist, Math.min(maxDist, pinchDist));
        const volume  = (clamped - minDist) / (maxDist - minDist);
        sendMsg({
          type: 'GESTURE_ACTION',
          action: pinchSetting.action,
          volume,
          icon: PINCH_CONFIG.icon,
          gestureName: PINCH_CONFIG.name,
        });
        resetDwell();
        return;
      }
    }

    // Discrete Gestures
    let matched = false;
    for (const gesture of GESTURE_TABLE) {
      const setting = gestureSettings[gesture.key];
      if (!setting || !setting.enabled) continue;
      if (gesture.recognize(landmarks)) {
        handleDiscreteGesture(gesture, setting);
        matched = true;
        break;
      }
    }
    if (!matched) resetDwell();
  }

  function stopCamera() {
    isRunning = false;
    if (frameTimer) { clearTimeout(frameTimer); frameTimer = null; }
    if (handsInstance) { handsInstance.close(); handsInstance = null; }
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
    if (cameraVideo) { cameraVideo.srcObject = null; }
    console.log('[Offscreen] Kamera kapatıldı.');
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  F. IPC — Mesaj Gönderme ve Alma
  // ═══════════════════════════════════════════════════════════════════════════

  function sendMsg(payload) {
    try {
      if (chrome?.runtime?.id) {
        chrome.runtime.sendMessage(payload, () => {
          if (chrome.runtime.lastError) { /* sessiz */ }
        });
      }
    } catch (e) { /* sessiz */ }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_CAMERA') {
      startCamera();
    } else if (message.type === 'STOP_CAMERA') {
      stopCamera();
    } else if (message.type === 'UPDATE_SETTINGS' && message.gestureSettings) {
      gestureSettings = { ...DEFAULT_SETTINGS, ...message.gestureSettings };
      console.log('[Offscreen] Ayarlar güncellendi.');
    }
    sendResponse({ status: 'ok' });
    return true;
  });

  console.log('[Offscreen] Hazır. START_CAMERA bekleniyor...');

})();
