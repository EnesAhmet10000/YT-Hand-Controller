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
    both_index_pointing_inner: 'Yemek Modu (👉+👈)',

    
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
    toggleFoodMode: 'Tümünü Dondur/Aç',
    profileLabel: 'Profil Seçimi:',
    addProfilePromt: 'Yeni profil için bir ad girin:',
    deleteProfileConfirm: ' profilini silmek istediğinize emin misiniz?',
    cannotDeleteLast: 'Düzenlenecek en az 1 profil bulunmak zorundadır!',
    cannotDeleteDefault: 'Varsayılan profil silinemez.',
    
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
    both_index_pointing_inner: 'Food Mode (👉+👈)',

    
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
    toggleFoodMode: 'Freeze All Gestures',
    profileLabel: 'Select Profile:',
    addProfilePromt: 'Enter name for the new profile:',
    deleteProfileConfirm: 'Are you sure you want to delete profile: ',
    cannotDeleteLast: 'There must be at least 1 profile to edit!',
    cannotDeleteDefault: 'The Default profile cannot be deleted.',
    
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
    both_index_pointing_inner: 'وضع الطعام (👉+👈)',

    
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
    toggleFoodMode: 'تجميد الإيماءات',
    profileLabel: 'اختر الملف الشخصي:',
    addProfilePromt: 'أدخل اسمًا للملف الشخصي الجديد:',
    deleteProfileConfirm: 'هل أنت متأكد أنك تريد حذف الملف الشخصي: ',
    cannotDeleteLast: 'يجب أن يكون هناك ملف شخصي واحد على الأقل للتعديل!',
    cannotDeleteDefault: 'لا يمكن حذف الملف الشخصي الافتراضي.',
    
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
  { key: 'both_index_pointing_inner', icon: '👉👈' },
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
  { value: 'toggleFoodMode' },
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
  both_index_pointing_inner: { enabled: true, action: 'toggleFoodMode'},
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
const profileLabelElem = document.getElementById('profileLabel');
const profileSelect = document.getElementById('profileSelect');
const addProfileBtn = document.getElementById('addProfileBtn');
const deleteProfileBtn = document.getElementById('deleteProfileBtn');

let currentLang = 'tr';
let profiles = {};
let activeProfile = 'Default';

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
  } else if (message.type === 'FOOD_MODE_UPDATE') {
    if (message.gestureSettings) {
      buildGestureRows(message.gestureSettings);
    }
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
  if (!profiles[activeProfile]) return;
  profiles[activeProfile].gestureSettings[key] = value;
  saveProfilesToStorage();
}

function saveProfilesToStorage() {
  chrome.storage.local.set({ profiles, activeProfile }, () => {
    const p = profiles[activeProfile];
    chrome.runtime.sendMessage({ 
      type: 'UPDATE_SETTINGS', 
      gestureSettings: p.gestureSettings,
      airMouseEnabled: p.airMouseEnabled,
      previewEnabled: p.previewEnabled,
      previewMode: p.previewMode
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
  if (profileLabelElem) profileLabelElem.textContent = translations[lang].profileLabel;
  
  updateCameraUI(toggle.checked);
  
  if (settings) {
    buildGestureRows(settings);
  } else if (profiles && profiles[activeProfile]) {
    buildGestureRows(profiles[activeProfile].gestureSettings);
  }
}

function applyProfileToUI() {
  if (!profiles[activeProfile]) return;
  const p = profiles[activeProfile];
  
  if (airMouseToggle) airMouseToggle.checked = p.airMouseEnabled;
  if (previewToggle) {
    previewToggle.checked = p.previewEnabled;
    if (previewModeContainer) previewModeContainer.style.display = p.previewEnabled ? 'flex' : 'none';
  }
  if (previewModeSelect) previewModeSelect.value = p.previewMode;

  if (profileSelect) {
    profileSelect.innerHTML = '';
    for (const pName in profiles) {
      const opt = document.createElement('option');
      opt.value = pName;
      opt.textContent = pName;
      if (pName === activeProfile) opt.selected = true;
      profileSelect.appendChild(opt);
    }
  }

  buildGestureRows(p.gestureSettings);
}

langSelect.addEventListener('change', (e) => {
  setLanguage(e.target.value);
});

// ─── Initialization ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // 1. Storage'dan Profil Bilgilerini Çek ve UI Oluştur
  chrome.storage.local.get({ language: 'tr', profiles: null, activeProfile: 'Default' }, (data) => {
    if (!data.profiles) {
      // Eski sürüm kuralı, yeni sisteme migrate et
      chrome.storage.local.get({ gestureSettings: DEFAULT_SETTINGS, airMouseEnabled: false, previewEnabled: false, previewMode: 'full' }, (oldData) => {
        profiles = {
          'Default': {
            gestureSettings: oldData.gestureSettings || DEFAULT_SETTINGS,
            airMouseEnabled: oldData.airMouseEnabled || false,
            previewEnabled: oldData.previewEnabled || false,
            previewMode: oldData.previewMode || 'full'
          }
        };
        activeProfile = 'Default';
        chrome.storage.local.set({ profiles, activeProfile });
        applyProfileToUI();
        setLanguage(data.language, profiles[activeProfile].gestureSettings);
      });
    } else {
      profiles = data.profiles;
      activeProfile = data.activeProfile;
      if (!profiles[activeProfile]) {
        activeProfile = Object.keys(profiles)[0] || 'Default';
        if (!profiles[activeProfile]) {
          profiles['Default'] = { gestureSettings: DEFAULT_SETTINGS, airMouseEnabled: false, previewEnabled: false, previewMode: 'full' };
          activeProfile = 'Default';
        }
      }
      applyProfileToUI();
      setLanguage(data.language, profiles[activeProfile].gestureSettings);
    }
  });

  // 2. Mevcut kamera durumunu background'dan sor
  chrome.runtime.sendMessage({ type: 'GET_CAMERA_STATE' }, (res) => {
    if (res) updateCameraUI(res.cameraOn);
  });

  // 3. Profil Seçimi
  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => {
      activeProfile = e.target.value;
      applyProfileToUI();
      saveProfilesToStorage();
    });
  }

  // 4. Yeni Profil Ekleme
  if (addProfileBtn) {
    addProfileBtn.addEventListener('click', () => {
      const name = prompt(translations[currentLang].addProfilePromt);
      if (name && name.trim() !== '') {
        const pName = name.trim();
        if (!profiles[pName]) {
          profiles[pName] = { 
            gestureSettings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), 
            airMouseEnabled: false, 
            previewEnabled: false, 
            previewMode: 'full' 
          };
          activeProfile = pName;
          applyProfileToUI();
          saveProfilesToStorage();
        }
      }
    });
  }

  // 4b. Profil Silme
  if (deleteProfileBtn) {
    deleteProfileBtn.addEventListener('click', () => {
      const pName = activeProfile;
      if (pName === 'Default') {
        alert(translations[currentLang].cannotDeleteDefault);
        return;
      }
      
      const profileNames = Object.keys(profiles);
      if (profileNames.length <= 1) {
        alert(translations[currentLang].cannotDeleteLast);
        return;
      }

      const confirmed = confirm(`"${pName}"` + translations[currentLang].deleteProfileConfirm);
      if (confirmed) {
        delete profiles[pName];
        activeProfile = Object.keys(profiles)[0] || 'Default';
        applyProfileToUI();
        saveProfilesToStorage();
      }
    });
  }

  // 5. Air Mouse Toggle Dinleyicisi
  if (airMouseToggle) {
    airMouseToggle.addEventListener('change', () => {
      profiles[activeProfile].airMouseEnabled = airMouseToggle.checked;
      saveProfilesToStorage();
    });
  }

  // 6. Preview Toggle Dinleyicisi
  if (previewToggle) {
    previewToggle.addEventListener('change', () => {
      if (previewModeContainer) previewModeContainer.style.display = previewToggle.checked ? 'flex' : 'none';
      profiles[activeProfile].previewEnabled = previewToggle.checked;
      saveProfilesToStorage();
    });
  }

  // 7. Preview Mode Dinleyicisi
  if (previewModeSelect) {
    previewModeSelect.addEventListener('change', () => {
      profiles[activeProfile].previewMode = previewModeSelect.value;
      saveProfilesToStorage();
    });
  }
});
