/**
 * ============================================================================
 *  YouTube Hand Control — Popup Logic (popup.js)
 * ============================================================================
 *  Ayarlar chrome.storage.local'da saklanır ve Offscreen dökümanına iletilir.
 * ============================================================================
 */

// ─── Constants ─────────────────────────────────────────────────────────────────

const translations = {
  tr: {
    both_hands_open: 'Çift El',
    both_index_up: 'Çift İşaret Yukarı',
    both_index_down: 'Çift İşaret Aşağı',
    open_palm: 'Açık El',
    index_up: 'İşaret Yukarı',
    index_down: 'İşaret Aşağı',
    palm_right: 'Sağ Avuç',
    palm_left: 'Sol Avuç',
    pointing_right: 'Sağa İşaret',
    pointing_left: 'Sola İşaret',
    vulcan: 'Vulcan',
    peace_sign: 'Zafer',
    pinch: 'Çimdik (Önerilmez)',

    
    togglePlay: 'Oynat / Durdur',
    toggleFullscreen: 'Tam Ekran',
    volumeUp5: 'Ses +%5',
    volumeDown5: 'Ses -%5',
    speedUp: 'Hız +0.25',
    speedDown: 'Hız −0.25',
    toggleMute: 'Sessize Al/Aç',
    seekForward: '5 Sn İleri',
    seekBackward: '5 Sn Geri',
    seekForward10: '10 Sn İleri',
    seekBackward10: '10 Sn Geri',
    nextVideo: 'Sonraki Video',
    previousVideo: 'Önceki Video',
    volumeControl: 'Ses Seviyesi',
    dynamicScroll: 'Dinamik Kaydırma (Avuç)',
    setMaxQuality: 'Kaliteyi Arttır',
    decreaseQualityOneStep: 'Kalite Düşür',
    mouseClick: 'Sol Tık (Left Click)',
    
    gestureSettings: 'Hareket Ayarları',
    statusOn: 'Aktif',
    statusOff: 'Kapalı',
    statusDenied: 'İzin Reddedildi',
    airMouse: 'Air Mouse Modu',
    cameraPreview: 'Kamera Önizleme',
    previewModeLabel: 'Önizleme Modu',
    optFullVideo: 'Tam Görüntü',
    optSkeleton: 'Sadece İskelet'
  },
  en: {
    both_hands_open: 'Both Hands',
    both_index_up: 'Both Index Up',
    both_index_down: 'Both Index Down',
    open_palm: 'Open Palm',
    index_up: 'Index Up',
    index_down: 'Index Down',
    palm_right: 'Palm Right',
    palm_left: 'Palm Left',
    pointing_right: 'Point Right',
    pointing_left: 'Point Left',
    vulcan: 'Vulcan',
    peace_sign: 'Peace Sign',
    pinch: 'Pinch (Not Recommended)',

    
    togglePlay: 'Play / Pause',
    toggleFullscreen: 'Fullscreen',
    volumeUp5: 'Volume +5%',
    volumeDown5: 'Volume -5%',
    speedUp: 'Speed +0.25',
    speedDown: 'Speed −0.25',
    toggleMute: 'Mute / Unmute',
    seekForward: 'Seek Forward 5s',
    seekBackward: 'Seek Backward 5s',
    seekForward10: 'Seek Forward 10s',
    seekBackward10: 'Seek Backward 10s',
    nextVideo: 'Next Video',
    previousVideo: 'Previous Video',
    volumeControl: 'Volume Control',
    dynamicScroll: 'Dynamic Scroll (Palm)',
    setMaxQuality: 'Increase Quality',
    decreaseQualityOneStep: 'Decrease Quality',
    mouseClick: 'Left Click',
    
    gestureSettings: 'Gesture Settings',
    statusOn: 'Active',
    statusOff: 'Off',
    statusDenied: 'Permission Denied',
    airMouse: 'Air Mouse Mode',
    cameraPreview: 'Camera Preview',
    previewModeLabel: 'Preview Mode',
    optFullVideo: 'Full Video',
    optSkeleton: 'Skeleton Only'
  },
  ar: {
    both_hands_open: 'كلتا اليدين',
    both_index_up: 'كلا السبابتين لأعلى',
    both_index_down: 'كلا السبابتين لأسفل',
    open_palm: 'كف مفتوح',
    index_up: 'السبابة لأعلى',
    index_down: 'السبابة لأسفل',
    palm_right: 'الكف لليمين',
    palm_left: 'الكف لليسار',
    pointing_right: 'إشارة لليمين',
    pointing_left: 'إشارة لليسار',
    vulcan: 'فولكان',
    peace_sign: 'علامة النصر',
    pinch: 'قرصة (غير مستحسن)',

    
    togglePlay: 'تشغيل / إيقاف',
    toggleFullscreen: 'ملء الشاشة',
    volumeUp5: 'رفع الصوت 5%',
    volumeDown5: 'خفض الصوت 5%',
    speedUp: 'تسريع +0.25',
    speedDown: 'إبطاء −0.25',
    toggleMute: 'كتم / إلغاء الكتم',
    seekForward: 'تقديم 5 ثوان',
    seekBackward: 'تأخير 5 ثوان',
    seekForward10: 'تقديم 10 ثوان',
    seekBackward10: 'تأخير 10 ثوان',
    nextVideo: 'الفيديو التالي',
    previousVideo: 'الفيديو السابق',
    volumeControl: 'التحكم بالصوت',
    dynamicScroll: 'التمرير الديناميكي (كف)',
    setMaxQuality: 'زيادة الجودة',
    decreaseQualityOneStep: 'تخفيض الجودة',
    mouseClick: 'نقر أيسر (Left Click)',
    
    gestureSettings: 'إعدادات الإيماءات',
    statusOn: 'نشط',
    statusOff: 'مغلق',
    statusDenied: 'تم رفض الإذن',
    airMouse: 'وضع الماوس الهوائي',
    cameraPreview: 'معاينة الكاميرا',
    previewModeLabel: 'وضع المعاينة',
    optFullVideo: 'فيديو كامل',
    optSkeleton: 'هيكل عظمي فقط'
  }
};

const GESTURES = [
  { key: 'both_hands_open',icon: '👐' },
  { key: 'both_index_up',  icon: '☝️+☝️' },
  { key: 'both_index_down',icon: '👇+👇' },
  { key: 'open_palm',      icon: '✋' },
  { key: 'index_up',       icon: '☝️' },
  { key: 'index_down',     icon: '👇' },
  { key: 'palm_right',     icon: '🫱' },
  { key: 'palm_left',      icon: '🫲' },
  { key: 'pointing_right', icon: '👉' },
  { key: 'pointing_left',  icon: '👈' },
  { key: 'peace_sign',     icon: '✌️' },
  { key: 'pinch',          icon: '🤏' },

];

const ACTIONS = [
  { value: 'togglePlay' },
  { value: 'toggleFullscreen' },
  { value: 'volumeUp5' },
  { value: 'volumeDown5' },
  { value: 'speedUp' },
  { value: 'speedDown' },
  { value: 'toggleMute' },
  { value: 'seekForward' },
  { value: 'seekBackward' },
  { value: 'seekForward10' },
  { value: 'seekBackward10' },
  { value: 'nextVideo' },
  { value: 'previousVideo' },
  { value: 'volumeControl' },
  { value: 'setMaxQuality' },
  { value: 'decreaseQualityOneStep' },
  { value: 'mouseClick' },
];

const DEFAULT_SETTINGS = {
  both_hands_open:{ enabled: true, action: 'toggleFullscreen'},
  both_index_up:  { enabled: true, action: 'setMaxQuality' },
  both_index_down:{ enabled: true, action: 'decreaseQualityOneStep' },
  open_palm:      { enabled: true, action: 'togglePlay'    },
  index_up:       { enabled: true, action: 'volumeUp5'     },
  index_down:     { enabled: true, action: 'volumeDown5'   },
  palm_right:     { enabled: true, action: 'speedUp'       },
  palm_left:      { enabled: true, action: 'speedDown'     },
  pointing_right: { enabled: true, action: 'seekForward10' },
  pointing_left:  { enabled: true, action: 'seekBackward10'},
  peace_sign:     { enabled: true, action: 'toggleMute'    },
  pinch:          { enabled: true, action: 'volumeControl' },

};


// ─── DOM Elements ──────────────────────────────────────────────────────────────
const toggle       = document.getElementById('cameraToggle');
const statusDot    = document.getElementById('statusDot');
const statusLbl    = document.getElementById('statusLabel');
const settingsDiv  = document.getElementById('gestureSettings');
const gesturesTitleElem = document.querySelector('.gestures-card h2');
const langSelect   = document.getElementById('langSelect');
const airMouseToggle = document.getElementById('airMouseToggle');
const airMouseLabel  = document.getElementById('airMouseLabel');
const previewToggle  = document.getElementById('previewToggle');
const previewLabel   = document.getElementById('previewLabel');
const previewModeContainer = document.getElementById('previewModeContainer');
const previewModeLabel = document.getElementById('previewModeLabel');
const previewModeSelect = document.getElementById('previewModeSelect');
const optFullVideo = document.getElementById('optFullVideo');
const optSkeleton = document.getElementById('optSkeleton');

let currentLang = 'tr';


// ─── UI: Camera Toggle Logic ───────────────────────────────────────────────────

function updateCameraUI(isOn) {
  toggle.checked = isOn;
  statusDot.className = `dot ${isOn ? 'on' : 'off'}`;
  statusLbl.textContent = isOn ? translations[currentLang].statusOn : translations[currentLang].statusOff;
}

toggle.addEventListener('change', async () => {
  const newState = toggle.checked;

  if (newState) {
    try {
      // 1. Kamera izni al (eğer yoksa)
      let needsPermission = true;
      try {
        const perm = await navigator.permissions.query({ name: 'camera' });
        if (perm && perm.state === 'granted') {
          needsPermission = false;
        }
      } catch (e) { /* ignore */ }

      if (needsPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        stream.getTracks().forEach((t) => t.stop());
      }
      
      // 2. Background'a "kamerayı aç" emri ver
      chrome.runtime.sendMessage({ type: 'SET_CAMERA_STATE', cameraOn: true });
    } catch (err) {
      console.error('[Popup] İzin hatası:', err);
      toggle.checked = false;
      updateCameraUI(false);
      statusLbl.textContent = translations[currentLang].statusDenied;
    }
  } else {
    // Kamerayı kapat
    chrome.runtime.sendMessage({ type: 'SET_CAMERA_STATE', cameraOn: false });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CAMERA_STATUS_UPDATE') {
    updateCameraUI(message.active);
  }
});


// ─── UI: Gesture Settings Builder ──────────────────────────────────────────────

function buildGestureRows(settings) {
  settingsDiv.innerHTML = '';
  const t = translations[currentLang];

  for (const g of GESTURES) {
    const s = settings[g.key] || DEFAULT_SETTINGS[g.key];

    const row = document.createElement('div');
    row.className = `gesture-row${s.enabled ? '' : ' disabled'}`;

    // --- Info (Icon + Name) ---
    const info = document.createElement('div');
    info.className = 'gesture-info';
    
    const icon = document.createElement('span');
    icon.className = 'g-icon';
    icon.textContent = g.icon;

    const name = document.createElement('span');
    name.className = 'g-name';
    name.textContent = t[g.key];

    info.appendChild(icon);
    info.appendChild(name);

    // --- Controls (Action Select + Mini Toggle) ---
    const controls = document.createElement('div');
    controls.className = 'controls-container';

    const select = document.createElement('select');
    select.className = 'action-select';
    for (const a of ACTIONS) {
      const opt = document.createElement('option');
      opt.value = a.value;
      opt.textContent = t[a.value];
      if (a.value === s.action) opt.selected = true;
      select.appendChild(opt);
    }

    const miniLabel = document.createElement('label');
    miniLabel.className = 'mini-switch';
    const miniInput = document.createElement('input');
    miniInput.type = 'checkbox';
    miniInput.checked = s.enabled;
    const miniSlider = document.createElement('span');
    miniSlider.className = 'mini-slider';
    miniLabel.appendChild(miniInput);
    miniLabel.appendChild(miniSlider);

    controls.appendChild(select);
    controls.appendChild(miniLabel);

    row.appendChild(info);
    row.appendChild(controls);
    settingsDiv.appendChild(row);

    // Events
    const update = () => {
      saveSetting(g.key, { enabled: miniInput.checked, action: select.value });
      row.classList.toggle('disabled', !miniInput.checked);
    };
    miniInput.addEventListener('change', update);
    select.addEventListener('change', update);
  }
}

function saveSetting(key, value) {
  chrome.storage.local.get({ gestureSettings: DEFAULT_SETTINGS }, (data) => {
    const settings = { ...DEFAULT_SETTINGS, ...data.gestureSettings };
    settings[key] = value;
    chrome.storage.local.set({ gestureSettings: settings }, () => {
      chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', gestureSettings: settings });
    });
  });
}

// ─── Language Logic ───────────────────────────────────────────────────────────

function setLanguage(lang, settings) {
  currentLang = lang;
  chrome.storage.local.set({ language: lang });
  langSelect.value = lang;
  
  if (lang === 'ar') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
  
  if (gesturesTitleElem) {
    gesturesTitleElem.textContent = translations[lang].gestureSettings;
  }
  if (airMouseLabel) {
    airMouseLabel.textContent = translations[lang].airMouse;
  }
  if (previewLabel) {
    previewLabel.textContent = translations[lang].cameraPreview;
    if (previewModeLabel) previewModeLabel.textContent = translations[lang].previewModeLabel;
    if (optFullVideo) optFullVideo.textContent = translations[lang].optFullVideo;
    if (optSkeleton) optSkeleton.textContent = translations[lang].optSkeleton;
  }
  
  updateCameraUI(toggle.checked);
  
  if (settings) {
    buildGestureRows(settings);
  } else {
    chrome.storage.local.get({ gestureSettings: DEFAULT_SETTINGS }, (data) => {
      buildGestureRows({ ...DEFAULT_SETTINGS, ...data.gestureSettings });
    });
  }
}

langSelect.addEventListener('change', (e) => {
  setLanguage(e.target.value);
});

// ─── Initialization ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // 1. Ayarları getir ve UI oluştur
  chrome.storage.local.get({ language: 'tr', gestureSettings: DEFAULT_SETTINGS, airMouseEnabled: false, previewEnabled: false, previewMode: 'full' }, (data) => {
    if (airMouseToggle) airMouseToggle.checked = data.airMouseEnabled;
    if (previewToggle) {
      previewToggle.checked = data.previewEnabled;
      if (previewModeContainer) previewModeContainer.style.display = data.previewEnabled ? 'flex' : 'none';
    }
    if (previewModeSelect) previewModeSelect.value = data.previewMode;
    
    const settings = { ...DEFAULT_SETTINGS, ...data.gestureSettings };
    if (!data.gestureSettings) {
      chrome.storage.local.set({ gestureSettings: settings });
    }
    setLanguage(data.language, settings);
  });

  // 2. Mevcut kamera durumunu background'dan sor
  chrome.runtime.sendMessage({ type: 'GET_CAMERA_STATE' }, (res) => {
    if (res) updateCameraUI(res.cameraOn);
  });

  // 3. Air Mouse Toggle Dinleyicisi
  if (airMouseToggle) {
    airMouseToggle.addEventListener('change', () => {
      chrome.storage.local.set({ airMouseEnabled: airMouseToggle.checked }, () => {
        chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', airMouseEnabled: airMouseToggle.checked });
      });
    });
  }

  // 4. Preview Toggle Dinleyicisi
  if (previewToggle) {
    previewToggle.addEventListener('change', () => {
      if (previewModeContainer) previewModeContainer.style.display = previewToggle.checked ? 'flex' : 'none';
      chrome.storage.local.set({ previewEnabled: previewToggle.checked }, () => {
        chrome.runtime.sendMessage({ type: 'TOGGLE_PREVIEW', previewEnabled: previewToggle.checked });
      });
    });
  }

  // 5. Preview Mode Dinleyicisi
  if (previewModeSelect) {
    previewModeSelect.addEventListener('change', () => {
      chrome.storage.local.set({ previewMode: previewModeSelect.value }, () => {
        chrome.runtime.sendMessage({ type: 'UPDATE_PREVIEW_MODE', previewMode: previewModeSelect.value });
      });
    });
  }
});
