/**
 * ============================================================================
 *  YouTube Hand Control — Service Worker (background.js)
 * ============================================================================
 *  Manifest V3 Service Worker.
 *  Single Source of Truth for camera ON/OFF state.
 *
 *  Sorumluluklar:
 *    1. Offscreen Document yaşam döngüsü yönetimi
 *    2. Popup ↔ Offscreen ↔ Content Script arası mesaj yönlendirme
 *    3. Camera state yönetimi (chrome.storage.local)
 * ============================================================================
 */

// ─── Offscreen Document Management ─────────────────────────────────────────────
let isCameraActive = false;
let intendedCameraState = false;

const OFFSCREEN_URL = 'offscreen.html';

/**
 * Offscreen document'ın var olup olmadığını kontrol eder.
 */
async function hasOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)],
  });
  return contexts.length > 0;
}

/**
 * Offscreen document yoksa oluşturur.
 */
async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ['USER_MEDIA'],
    justification: 'Camera access for MediaPipe hand gesture recognition',
  });

  console.log('[Background] Offscreen document oluşturuldu.');
}

/**
 * Offscreen document varsa kapatır.
 */
async function closeOffscreenDocument() {
  if (!(await hasOffscreenDocument())) return;

  await chrome.offscreen.closeDocument();
  console.log('[Background] Offscreen document kapatıldı.');
}


// ─── Safe Message Helper ───────────────────────────────────────────────────────

/**
 * chrome.runtime.sendMessage'ı güvenli şekilde çağırır.
 * Bağlantı kopuksa veya alıcı yoksa sessizce hata yazar.
 */
function safeSendMessage(payload) {
  try {
    chrome.runtime.sendMessage(payload, () => {
      if (chrome.runtime.lastError) {
        console.warn('[Background] Mesaj gönderilemedi:', chrome.runtime.lastError.message);
      }
    });
  } catch (e) {
    console.warn('[Background] sendMessage hatası:', e.message);
  }
}


// ─── Message Router ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Popup → Background mesajları
  if (message.type === 'GET_CAMERA_STATE') {
    handleGetState(sendResponse);
    return true;
  }

  if (message.type === 'SET_CAMERA_STATE') {
    handleSetState(message, sendResponse);
    return true;
  }

  if (message.type === 'CAMERA_STATUS') {
    isCameraActive = message.active;
    chrome.storage.local.set({ cameraOn: message.active }); // Storage'ı gerçek duruma eşitle
    safeSendMessage({ type: 'CAMERA_STATUS_UPDATE', active: message.active });
    broadcastToYouTubeTabs(message.active);
    sendResponse({ status: 'ok' });
    return true;
  }

  if (
    message.type === 'GESTURE_ACTION' ||
    message.type === 'GESTURE_DWELL' ||
    message.type === 'GESTURE_RESET' ||
    message.type === 'MOUSE_MOVE' ||
    message.type === 'MOUSE_CLICK' ||
    message.type === 'PREVIEW_FRAME' ||
    message.type === 'PREVIEW_CLOSED'
  ) {
    forwardToActiveYouTubeTab(message);
    sendResponse({ status: 'ok' });
    return true;
  }

  if (message.type === 'TOGGLE_FOOD_MODE') {
    chrome.storage.local.get({ profiles: null, activeProfile: 'Default', isFoodMode: false, tempDisabledStates: {} }, (data) => {
      let profiles = data.profiles;
      let activeProfile = data.activeProfile;
      if (!profiles || !profiles[activeProfile]) return;
      
      let settings = profiles[activeProfile].gestureSettings || {};
      let isFoodMode = data.isFoodMode;
      let tempDisabledStates = data.tempDisabledStates;
      
      if (!isFoodMode) {
        isFoodMode = true;
        tempDisabledStates = {};
        for (const key in settings) {
          // Yemek modunu geri kapatacak olan "toggleFoodMode" eylemine sahip hareketler ASLA dondurulmaz.
          if (settings[key].enabled && settings[key].action !== 'toggleFoodMode') {
            tempDisabledStates[key] = true;
            settings[key].enabled = false;
          }
        }
        forwardToActiveYouTubeTab({ type: 'FOOD_MODE_ACTIVATED' });
      } else {
        isFoodMode = false;
        for (const key in tempDisabledStates) {
          if (settings[key]) {
            settings[key].enabled = true;
          }
        }
        tempDisabledStates = {};
        forwardToActiveYouTubeTab({ type: 'FOOD_MODE_DEACTIVATED' });
      }
      
      profiles[activeProfile].gestureSettings = settings;
      chrome.storage.local.set({ profiles: profiles, isFoodMode: isFoodMode, tempDisabledStates: tempDisabledStates }, () => {
        safeSendMessage({ type: 'UPDATE_SETTINGS', gestureSettings: settings });
        safeSendMessage({ type: 'FOOD_MODE_UPDATE', gestureSettings: settings });
      });
    });
    sendResponse({ status: 'ok' });
    return true;
  }

  // Keep-Alive desteği: Offscreen sayfasının kapanmasını önlemek için
  if (message.type === 'KEEP_ALIVE') {
    sendResponse({ status: 'awake' });
    return true;
  }
});


// ─── State Handlers ────────────────────────────────────────────────────────────

/**
 * Mevcut kamera durumunu bellekteki Global State'den (veya varsayılan olarak) okur.
 */
function handleGetState(sendResponse) {
  sendResponse({ cameraOn: isCameraActive });
}

/**
 * Kamera durumunu günceller ve Offscreen document'ı yönetir.
 */
async function handleSetState(message, sendResponse) {
  intendedCameraState = message.cameraOn;

  if (message.cameraOn) {
    try { await ensureOffscreenDocument(); } catch(e) {}
    await new Promise((r) => setTimeout(r, 800)); // Offscreen bekle
    
    // Yükleme süresi boyunca kullanıcı kamerayı geri KAPATMIŞ olabilir mi?
    if (intendedCameraState) {
      const data = await chrome.storage.local.get({ profiles: null, activeProfile: 'Default' });
      const activeProf = data.activeProfile || 'Default';
      const profData = (data.profiles && data.profiles[activeProf]) ? data.profiles[activeProf] : { gestureSettings: null, airMouseEnabled: false, previewEnabled: false, previewMode: 'full' };
      
      safeSendMessage({ type: 'START_CAMERA', gestureSettings: profData.gestureSettings, airMouseEnabled: profData.airMouseEnabled, previewEnabled: profData.previewEnabled, previewMode: profData.previewMode });
    }
  } else {
    safeSendMessage({ type: 'STOP_CAMERA' });
    
    setTimeout(async () => {
      // Beklerken kullanıcı kamerayı geri AÇMIŞ olabilir mi?
      if (!intendedCameraState) {
        try { await closeOffscreenDocument(); } catch(e) {}
      }
    }, 500);
  }

  sendResponse({ pending: true });
}


// ─── Forwarding & Broadcast ────────────────────────────────────────────────────

/**
 * Aktif YouTube sekmesine mesaj yönlendirir.
 */
function forwardToActiveYouTubeTab(message) {
  // Sadece aktif, mevcut penceredeki YouTube sekmelerine gönder
  chrome.tabs.query({ url: '*://*.youtube.com/*', active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;
    
    tabs.forEach((tab) => {
      if (!tab.id) return;
      try {
        chrome.tabs.sendMessage(tab.id, message, () => {
          if (chrome.runtime.lastError) { /* Sessizce yut - Konsolu kirletme */ }
        });
      } catch (e) { /* Sessiz hata yönetimi */ }
    });
  });
}

/**
 * Tüm açık YouTube sekmelerine CAMERA_STATE_CHANGED mesajı gönderir.
 */
function broadcastToYouTubeTabs(cameraOn) {
  const payload = { type: 'CAMERA_STATE_CHANGED', cameraOn };
  chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
    tabs.forEach((tab) => {
      try {
        chrome.tabs.sendMessage(tab.id, payload, () => {
          if (chrome.runtime.lastError) { /* Sessizce yut */ }
        });
      } catch (e) { /* Sessizce yut */ }
    });
  });
}


// ─── Extension Install / Update ────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ cameraOn: false });
});
