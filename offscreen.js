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
    // İşaret parmağı (8), X ekseninde kendi kökünden (5) tam olarak 0.08 birim sağa taşmalı
    const isRight = lm[8].x > (lm[5].x + 0.08); 
    
    // El yana doğru yattığı için Y eksenli (y > y) kapalı kontrolü çalışmaz!
    // Bunun yerine: Parmak ucu (12) bileğe (0), orta ekleminden (10) daha yakınsa = Kesin kapalıdır.
    const isMiddleClosed = euclidean(lm[12], lm[0]) < euclidean(lm[10], lm[0]);
    const isRingClosed   = euclidean(lm[16], lm[0]) < euclidean(lm[14], lm[0]);
    const isPinkyClosed  = euclidean(lm[20], lm[0]) < euclidean(lm[18], lm[0]);

    return isRight && isMiddleClosed && isRingClosed && isPinkyClosed;
  }

  function isPointingLeft(lm) {
    // İşaret parmağı (8), X ekseninde kendi kökünden (5) tam olarak 0.08 birim sola taşmalı
    const isLeft = lm[8].x < (lm[5].x - 0.08);
    
    const isMiddleClosed = euclidean(lm[12], lm[0]) < euclidean(lm[10], lm[0]);
    const isRingClosed   = euclidean(lm[16], lm[0]) < euclidean(lm[14], lm[0]);
    const isPinkyClosed  = euclidean(lm[20], lm[0]) < euclidean(lm[18], lm[0]);

    return isLeft && isMiddleClosed && isRingClosed && isPinkyClosed;
  }

  function isMouseActive(lm) {
    const isPinchClosed = euclidean(lm[8], lm[4]) < 0.04;
    const isMiddleOpen = lm[12].y < lm[10].y;
    const isRingOpen = lm[16].y < lm[14].y;
    const isPinkyOpen = lm[20].y < lm[18].y;
    return isPinchClosed && isMiddleOpen && isRingOpen && isPinkyOpen;
  }

  function isIndexUp(lm) {
    const indexOpen = lm[8].y < lm[6].y;
    const othersClosed = lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return indexOpen && othersClosed;
  }

  function isBothIndexUp(lm, results) {
    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length !== 2) return false;
    return isIndexUp(results.multiHandLandmarks[0]) && isIndexUp(results.multiHandLandmarks[1]);
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

  function isPeaceSign(lm) {
    // Hem İşaret (8) hem de Orta (12) KESİN açık olmalı. Orta parmak kapalıysa ASLA Peace Sign olamaz.
    const mainOpen = lm[8].y < lm[6].y && lm[12].y < lm[10].y;
    // Yüzük (16) ve Serçe (20) KESİN kapalı olmalı
    const othersClosed = lm[16].y > lm[14].y && lm[20].y > lm[18].y;
    return mainOpen && othersClosed;
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  B. GESTURE TABLE
  // ═══════════════════════════════════════════════════════════════════════════

  const GESTURE_TABLE = [
    { key: 'both_hands_open',recognize: isBothHandsOpen, icon: '👐', name: 'Both_Hands'     },
    { key: 'both_index_up',  recognize: isBothIndexUp,   icon: '🙌', name: 'Both_Index_Up'  },
    { key: 'open_palm',      recognize: isOpenPalm,      icon: '✋', name: 'Open_Palm'      },
    { key: 'index_up',       recognize: isIndexUp,       icon: '☝️', name: 'Index_Up'       },
    { key: 'palm_right',     recognize: isPalmRight,     icon: '🫱', name: 'Palm_Right'     },
    { key: 'palm_left',      recognize: isPalmLeft,      icon: '🫲', name: 'Palm_Left'      },
    { key: 'pointing_right', recognize: isPointingRight, icon: '👉', name: 'Pointing_Right' },
    { key: 'pointing_left',  recognize: isPointingLeft,  icon: '👈', name: 'Pointing_Left'  },
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
    both_index_up:  { enabled: true, action: 'setMaxQuality' },
    open_palm:      { enabled: true, action: 'togglePlay'    },
    index_up:       { enabled: true, action: 'volumeUp5'     },
    palm_right:     { enabled: true, action: 'speedUp'       },
    palm_left:      { enabled: true, action: 'speedDown'     },
    pointing_right: { enabled: true, action: 'seekForward10' },
    pointing_left:  { enabled: true, action: 'seekBackward10'},
    peace_sign:     { enabled: true, action: 'toggleMute'    },
    pinch:          { enabled: true, action: 'volumeControl' },
  };

  let gestureSettings = { ...DEFAULT_SETTINGS };


  // ═══════════════════════════════════════════════════════════════════════════
  //  D. DWELL TIME CONTROLLER — Midas Touch Koruması + Cooldown
  // ═══════════════════════════════════════════════════════════════════════════

  const DEFAULT_DWELL_MS = 600;
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

    // Tıklamanın (Left Click) fare hızında olması için dolum süresi (Dwell) daha kısadır
    const requiredDwell = setting.action === 'mouseClick' ? 250 : DEFAULT_DWELL_MS;
    const elapsed  = now - dwellState.startTime;
    const progress = Math.min(elapsed / requiredDwell, 1.0);

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
      if (setting.action === 'setMaxQuality') cooldown = 3000; // Çift parmak kalite ayarı için uzun bekleme
      if (setting.action === 'volumeUp5' || setting.action === 'volumeDown5') cooldown = 400;
      if (setting.action === 'mouseClick') cooldown = 300; // Hızlı tıklama için kısa cooldown
      
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

  let airMouseEnabled = false;
  let airMouseState = { active: false, lastX: 0, lastY: 0, stationaryTime: 0, lastPinchEndTime: 0 };

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
      sendMsg({ type: 'CAMERA_STATUS', active: true });
      processFrame();

    } catch (err) {
      console.error('[Offscreen] Kamera hatası:', err);
      sendMsg({ type: 'CAMERA_STATUS', active: false });
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

    // AIR MOUSE Priority Check (Hiyerarşi 1)
    if (airMouseEnabled && isMouseActive(landmarks) && results.multiHandLandmarks.length === 1) {
      const currentX = (landmarks[8].x + landmarks[4].x) / 2;
      const currentY = (landmarks[8].y + landmarks[4].y) / 2;

      if (!airMouseState.active) {
        airMouseState.active = true;
      }

      sendMsg({ type: 'MOUSE_MOVE', x: currentX, y: currentY });
      airMouseState.lastX = currentX;
      airMouseState.lastY = currentY;
      resetDwell();
      return;
    } else {
      if (airMouseState.active) {
        airMouseState.active = false;
      }
    }

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

    // Hiyerarşik Eşleşme: "Orta Parmak Kilidi" prensibiyle Peace(V) mutlaka Pointing(👉/👈) öncesinde sorgulanmalı.
    if (processGesture('both_hands_open', isBothHandsOpen)) { /* matched */ }
    else if (processGesture('both_index_up', isBothIndexUp)) { /* matched */ }
    else if (processGesture('peace_sign', isPeaceSign)) { /* matched */ } // Orta parmak kapalıysa burayı atlar
    else if (processGesture('index_up', isIndexUp)) { /* matched */ }
    else if (processGesture('pointing_right', isPointingRight)) { /* matched */ } // İşaret var, Orta/Yüzük/Serçe kapalı
    else if (processGesture('pointing_left', isPointingLeft)) { /* matched */ }
    else if (processGesture('palm_right', isPalmRight)) { /* matched */ }
    else if (processGesture('palm_left', isPalmLeft)) { /* matched */ }
    else if (processGesture('open_palm', isOpenPalm)) { /* matched */ }

    if (!matched) resetDwell();
  }

  function stopCamera() {
    isRunning = false;
    if (frameTimer) { clearTimeout(frameTimer); frameTimer = null; }
    
    // ÖNCELİKLE donanım kaynaklarını serbest bırak (Kamera lambasını anında kapatır)
    if (cameraStream) { 
        cameraStream.getTracks().forEach(t => t.stop()); 
        cameraStream = null; 
    }
    if (cameraVideo) { cameraVideo.srcObject = null; }
    
    try {
        if (handsInstance) { handsInstance.close(); handsInstance = null; }
    } catch (e) {
        // MediaPipe kapatma esnasında bir hata fırlatırsa yutuyoruz
    }
    
    console.log('[Offscreen] Kamera tamamen kapatıldı.');
    sendMsg({ type: 'CAMERA_STATUS', active: false });
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
      if (message.gestureSettings) gestureSettings = { ...DEFAULT_SETTINGS, ...message.gestureSettings };
      if (message.airMouseEnabled !== undefined) airMouseEnabled = message.airMouseEnabled;
      startCamera();
    } else if (message.type === 'STOP_CAMERA') {
      stopCamera();
    } else if (message.type === 'UPDATE_SETTINGS') {
      if (message.gestureSettings) gestureSettings = { ...DEFAULT_SETTINGS, ...message.gestureSettings };
      if (message.airMouseEnabled !== undefined) airMouseEnabled = message.airMouseEnabled;
      console.log('[Offscreen] Ayarlar güncellendi.');
    }
    sendResponse({ status: 'ok' });
    return true;
  });

  console.log('[Offscreen] Hazır. START_CAMERA bekleniyor...');

})();
