/**
 * ============================================================================
 *  YouTube Hand Control — Popup Logic (popup.js)
 * ============================================================================
 *  Ayarlar chrome.storage.local'da saklanır ve Offscreen dökümanına iletilir.
 * ============================================================================
 */

// ─── Constants ─────────────────────────────────────────────────────────────────

const GESTURES = [
  { key: 'open_palm',  icon: '✋', name: 'Açık El'    },
  { key: 'thumbs_up',  icon: '👍', name: 'Başparmak ↑' },
  { key: 'peace_sign', icon: '✌️', name: 'Zafer'      },
  { key: 'fist',       icon: '✊', name: 'Yumruk'     },
  { key: 'pinch',      icon: '🤏', name: 'Çimdik'     },
];

const ACTIONS = [
  { value: 'togglePlay',  label: 'Oynat / Durdur' },
  { value: 'speedUp',     label: 'Hız +0.25'      },
  { value: 'speedDown',   label: 'Hız −0.25'      },
  { value: 'toggleMute',  label: 'Sessize Al/Aç'  },
  { value: 'seekForward', label: '5 Sn İleri'      },
  { value: 'seekBackward',label: '5 Sn Geri'       },
  { value: 'volumeControl', label: 'Ses Seviyesi'  },
];

const DEFAULT_SETTINGS = {
  open_palm:  { enabled: true, action: 'togglePlay'    },
  thumbs_up:  { enabled: true, action: 'speedUp'       },
  peace_sign: { enabled: true, action: 'toggleMute'    },
  fist:       { enabled: true, action: 'seekBackward'  },
  pinch:      { enabled: true, action: 'volumeControl' },
};


// ─── DOM Elements ──────────────────────────────────────────────────────────────
const toggle       = document.getElementById('cameraToggle');
const statusDot    = document.getElementById('statusDot');
const statusLbl    = document.getElementById('statusLabel');
const settingsDiv  = document.getElementById('gestureSettings');


// ─── UI: Camera Toggle Logic ───────────────────────────────────────────────────

function updateCameraUI(isOn) {
  toggle.checked = isOn;
  statusDot.className = `dot ${isOn ? 'on' : 'off'}`;
  statusLbl.textContent = isOn ? 'Aktif' : 'Kapalı';
}

toggle.addEventListener('change', async () => {
  const newState = toggle.checked;

  if (newState) {
    try {
      // 1. Kamera izni al (eğer yoksa)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop()); // İzni aldık, stream'i kapıyoruz
      
      // 2. Background'a "kamerayı aç" emri ver
      chrome.runtime.sendMessage(
        { type: 'SET_CAMERA_STATE', cameraOn: true },
        (res) => { if (res) updateCameraUI(res.cameraOn); }
      );
    } catch (err) {
      console.error('[Popup] İzin hatası:', err);
      toggle.checked = false;
      updateCameraUI(false);
      statusLbl.textContent = 'İzin Reddedildi';
    }
  } else {
    // Kamerayı kapat
    chrome.runtime.sendMessage(
      { type: 'SET_CAMERA_STATE', cameraOn: false },
      (res) => { if (res) updateCameraUI(res.cameraOn); }
    );
  }
});


// ─── UI: Gesture Settings Builder ──────────────────────────────────────────────

function buildGestureRows(settings) {
  settingsDiv.innerHTML = '';

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
    name.textContent = g.name;

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
      opt.textContent = a.label;
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


// ─── Initialization ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // 1. Ayarları getir ve UI oluştur
  chrome.storage.local.get({ gestureSettings: DEFAULT_SETTINGS }, (data) => {
    const settings = { ...DEFAULT_SETTINGS, ...data.gestureSettings };
    // Eğer storage hiç yoksa (ilk kuruş), varsayılana eşitle
    if (!data.gestureSettings) {
      chrome.storage.local.set({ gestureSettings: settings });
    }
    buildGestureRows(settings);
  });

  // 2. Mevcut kamera durumunu background'dan sor
  chrome.runtime.sendMessage({ type: 'GET_CAMERA_STATE' }, (res) => {
    if (res) updateCameraUI(res.cameraOn);
  });
});
