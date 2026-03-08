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

  function getHandAngle(lm) {
    // Bilek (0) ile orta parmak kökü (9) arasındaki açıyı hesapla. Üst: -90, Sağ: 0, Sol: -180/180
    const dy = lm[9].y - lm[0].y;
    const dx = lm[9].x - lm[0].x;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  function isOpenPalm(lm) {
    const angle = getHandAngle(lm);
    // Elin dikey (yukarı yönlü) durma açısı: -135 ile -45 derece arası olmalı
    if (angle < -135 || angle > -45) return false;

    // Parmakların Y ekseninde yukarı doğru açık olup olmadığını kontrol et
    return lm[8].y < lm[6].y && lm[12].y < lm[10].y &&
           lm[16].y < lm[14].y && lm[20].y < lm[18].y;
  }

  function isBothHandsOpen(lm, results) {
    // Ekranda aynı kare (frame) içinde tam 2 el algılandığından emin ol
    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length !== 2) return false;
    
    const lm1 = results.multiHandLandmarks[0];
    const lm2 = results.multiHandLandmarks[1];
    
    // İki elin de koordinatlarının Açık El (isOpenPalm) şartını sağladığını kontrol et
    return isOpenPalm(lm1) && isOpenPalm(lm2);
  }

  function isPointingRight(lm) {
    const isHorizontal = Math.abs(lm[8].y - lm[5].y) < 0.1;
    const isRight = lm[8].x > (lm[5].x + 0.08);
    const othersClosed = lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return isHorizontal && isRight && othersClosed;
  }

  function isPointingLeft(lm) {
    const isHorizontal = Math.abs(lm[8].y - lm[5].y) < 0.1;
    const isLeft = lm[8].x < (lm[5].x - 0.08);
    const othersClosed = lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return isHorizontal && isLeft && othersClosed;
  }

  function isIndexUp(lm) {
    const indexOpen = lm[8].y < lm[6].y;
    const othersClosed = lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return indexOpen && othersClosed;
  }

  function getPinchDistance(lm) {
    return euclidean(lm[4], lm[8]);
  }

  function isPalmRight(lm) {
    const angle = getHandAngle(lm);
    // Elin sağa doğru durma açısı: -45 ile +45 derece arası
    if (angle < -45 || angle > 45) return false;

    // Parmakların yatay eksende sağa durup durmadığını kontrol et
    return lm[8].x > lm[6].x && lm[12].x > lm[10].x &&
           lm[16].x > lm[14].x && lm[20].x > lm[18].x;
  }

  function isPalmLeft(lm) {
    const angle = getHandAngle(lm);
    // Elin sola doğru durma açısı: 135'ten büyük veya -135'ten küçük
    if (angle > -135 && angle < 135) return false;

    // Parmakların yatay eksende sola durup durmadığını kontrol et
    return lm[8].x < lm[6].x && lm[12].x < lm[10].x &&
           lm[16].x < lm[14].x && lm[20].x < lm[18].x;
  }

  function isVulcan(lm) {
    // İşaret(8) ve Orta(12) açık ve bitişik mi
    const firstGroupOpen = lm[8].y < lm[6].y && lm[12].y < lm[10].y && Math.abs(lm[8].x - lm[12].x) < 0.1;
    // Yüzük(16) ve Serçe(20) açık ve bitişik mi
    const secondGroupOpen = lm[16].y < lm[14].y && lm[20].y < lm[18].y && Math.abs(lm[16].x - lm[20].x) < 0.1;
    // İki grup biribirinden ayrık olmalı (Spock hareketi) "V" şeklinde
    const isSeparated = Math.abs(lm[12].x - lm[16].x) > 0.05;

    return firstGroupOpen && secondGroupOpen && isSeparated;
  }

  function isPeaceSign(lm) {
    const mainOpen = lm[8].y < lm[6].y && lm[12].y < lm[10].y;
    const othersClosed = lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return mainOpen && othersClosed;
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  B. GESTURE TABLE
  // ═══════════════════════════════════════════════════════════════════════════

  const GESTURE_TABLE = [
    { key: 'both_hands_open',recognize: isBothHandsOpen, icon: '👐', name: 'Both_Hands'     },
    { key: 'open_palm',      recognize: isOpenPalm,      icon: '✋', name: 'Open_Palm'      },
    { key: 'index_up',       recognize: isIndexUp,       icon: '☝️', name: 'Index_Up'       },
    { key: 'palm_right',     recognize: isPalmRight,     icon: '🫱', name: 'Palm_Right'     },
    { key: 'palm_left',      recognize: isPalmLeft,      icon: '🫲', name: 'Palm_Left'      },
    { key: 'pointing_right', recognize: isPointingRight, icon: '👉', name: 'Pointing_Right' },
    { key: 'pointing_left',  recognize: isPointingLeft,  icon: '👈', name: 'Pointing_Left'  },
    { key: 'vulcan',         recognize: isVulcan,        icon: '🖖', name: 'Vulcan'         },
    { key: 'peace_sign',     recognize: isPeaceSign,     icon: '✌️', name: 'Peace_Sign'     },
  ];

  const PINCH_CONFIG = {
    key: 'pinch', icon: '🤏', name: 'Pinch_Volume',
    minDist: 0.02, maxDist: 0.28,
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //  C. SETTINGS — Hardcoded (chrome.storage KULLANILMAZ)
  // ═══════════════════════════════════════════════════════════════════════════

  const DEFAULT_SETTINGS = {
    both_hands_open:{ enabled: true, action: 'toggleFullscreen'},
    open_palm:      { enabled: true, action: 'togglePlay'    },
    index_up:       { enabled: true, action: 'volumeUp5'     },
    vulcan:         { enabled: true, action: 'volumeDown5'   },
    palm_right:     { enabled: true, action: 'speedUp'       },
    palm_left:      { enabled: true, action: 'speedDown'     },
    pointing_right: { enabled: true, action: 'seekForward10' },
    pointing_left:  { enabled: true, action: 'seekBackward10'},
    peace_sign:     { enabled: true, action: 'toggleMute'    },
    pinch:          { enabled: true, action: 'volumeControl' },
  };

  let gestureSettings = { ...DEFAULT_SETTINGS };


  // ═══════════════════════════════════════════════════════════════════════════
  //  D. DWELL TIME CONTROLLER — Midas Touch Koruması (600ms) + Cooldown
  // ═══════════════════════════════════════════════════════════════════════════

  const DWELL_MS = 600;
  let dwellState = { currentGesture: null, startTime: 0, fired: false };

  let lastActionTime = 0;
  // Genel cooldown 800ms. Çift el tam ekran vb. için eyleme bağlı cooldown eklendi
  const DEFAULT_COOLDOWN = 800;

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
      // Eyleme özel cooldown hesapla
      let cooldown = DEFAULT_COOLDOWN;
      if (gesture.key === 'both_hands_open') cooldown = 2000;
      if (setting.action === 'volumeUp5' || setting.action === 'volumeDown5') cooldown = 400; // Akıcı ses kontrolü için kısa cooldown
      
      if (now - lastActionTime < cooldown) return;

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
        maxNumHands: 2,
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
      const isPinchShape = landmarks[12].y > landmarks[10].y && 
                           landmarks[16].y > landmarks[14].y && 
                           landmarks[20].y > landmarks[18].y;

      if (isPinchShape && results.multiHandLandmarks.length === 1) {
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
    }

    // Discrete Gestures: Strictly defined else if hierarchy
    let matched = false;
    
    const processGesture = (key, recognizer) => {
      const s = gestureSettings[key];
      if (s && s.enabled && recognizer(landmarks, results)) {
        handleDiscreteGesture(GESTURE_TABLE.find(g => g.key === key), s);
        matched = true;
        return true;
      }
      return false;
    };

    if (processGesture('both_hands_open', isBothHandsOpen)) { /* matched */ }
    else if (processGesture('vulcan', isVulcan)) { /* matched */ }
    else if (processGesture('peace_sign', isPeaceSign)) { /* matched */ }
    else if (processGesture('index_up', isIndexUp)) { /* matched */ }
    else if (processGesture('palm_right', isPalmRight)) { /* matched */ }
    else if (processGesture('palm_left', isPalmLeft)) { /* matched */ }
    else if (processGesture('pointing_right', isPointingRight)) { /* matched */ }
    else if (processGesture('pointing_left', isPointingLeft)) { /* matched */ }
    else if (processGesture('open_palm', isOpenPalm)) { /* matched */ }

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
