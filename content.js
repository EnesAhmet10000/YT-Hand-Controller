/**
 * ============================================================================
 *  YouTube Hand Control — Content Script (content.js)
 * ============================================================================
 *  V2.0 — Offscreen Document API + Dinamik Ayar Sistemi
 *
 *  Bu dosya SADECE YouTube DOM'u ile ilgilenir:
 *    - YouTube <video> elementini kontrol eder
 *    - Overlay UI (Toast, Dwell Progress, Status) gösterir
 *    - Offscreen'den gelen GESTURE mesajlarını dinler ve eyleme geçirir
 * ============================================================================
 */

(() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  //  A. VIDEO CONTROLLER — YouTube <video> Element API
  // ═══════════════════════════════════════════════════════════════════════════

  function getVideoElement() {
    return document.querySelector('video.html5-main-video')
        || document.querySelector('video');
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  B. ACTION MAP — Aksiyon Adı → DOM Operasyonu (Eksiksiz)
  // ═══════════════════════════════════════════════════════════════════════════

  const ACTION_MAP = {
    togglePlay: (video) => {
      video.paused ? video.play() : video.pause();
      return video.paused ? '⏸ Duraklatıldı' : '▶ Oynatılıyor';
    },
    speedUp: (video) => {
      video.playbackRate = Math.min(video.playbackRate + 0.25, 3.0);
      return `⚡ Hız: ${video.playbackRate.toFixed(2)}x`;
    },
    speedDown: (video) => {
      video.playbackRate = Math.max(video.playbackRate - 0.25, 0.25);
      return `🐢 Hız: ${video.playbackRate.toFixed(2)}x`;
    },
    toggleMute: (video) => {
      video.muted = !video.muted;
      return video.muted ? '🔇 Ses Kapatıldı' : '🔊 Ses Açıldı';
    },
    seekForward: (video) => {
      video.currentTime = Math.min(video.currentTime + 5, video.duration);
      return '⏩ 5 Sn İleri';
    },
    seekBackward: (video) => {
      video.currentTime = Math.max(video.currentTime - 5, 0);
      return '⏪ 5 Sn Geri';
    },
    volumeControl: (video, data) => {
      if (data && data.volume !== undefined) {
        video.volume = data.volume;
      }
      return null; // Volume UI ayrı yönetilir
    },
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //  C. OVERLAY UI — DOM Enjeksiyonları
  // ═══════════════════════════════════════════════════════════════════════════

  const OVERLAY_ID  = 'yt-handcontrol-overlay';
  const TOAST_ID    = 'yt-handcontrol-toast';
  const PROGRESS_ID = 'yt-handcontrol-progress';
  const STATUS_ID   = 'yt-handcontrol-status';

  function getOrCreateOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <style>
        #${OVERLAY_ID} {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          pointer-events: none;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        #${STATUS_ID} {
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #e0e0e0;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.3s, transform 0.3s;
        }
        #${STATUS_ID}.visible {
          opacity: 1;
          transform: translateX(0);
        }
        #${PROGRESS_ID} {
          width: 52px;
          height: 52px;
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.25s, transform 0.25s;
        }
        #${PROGRESS_ID}.visible {
          opacity: 1;
          transform: scale(1);
        }
        #${PROGRESS_ID} .progress-bg {
          fill: none;
          stroke: rgba(255,255,255,0.1);
          stroke-width: 4;
        }
        #${PROGRESS_ID} .progress-bar {
          fill: none;
          stroke: #6c5ce7;
          stroke-width: 4;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: center;
          transition: stroke-dashoffset 0.08s linear;
        }
        #${PROGRESS_ID} .progress-icon {
          font-size: 18px;
          dominant-baseline: central;
          text-anchor: middle;
        }
        #${TOAST_ID} {
          background: rgba(108, 92, 231, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px rgba(108, 92, 231, 0.3);
        }
        #${TOAST_ID}.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      </style>
      <div id="${STATUS_ID}"></div>
      <svg id="${PROGRESS_ID}" viewBox="0 0 52 52">
        <circle class="progress-bg"  cx="26" cy="26" r="22" />
        <circle class="progress-bar" cx="26" cy="26" r="22"
                stroke-dasharray="138.23"
                stroke-dashoffset="138.23" />
        <text class="progress-icon" x="26" y="27"></text>
      </svg>
      <div id="${TOAST_ID}"></div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function updateDwellProgress(progress, icon, gestureName) {
    getOrCreateOverlay();
    const svg  = document.getElementById(PROGRESS_ID);
    const bar  = svg.querySelector('.progress-bar');
    const text = svg.querySelector('.progress-icon');
    const circumference = 2 * Math.PI * 22;

    bar.style.strokeDashoffset = circumference * (1 - progress);
    text.textContent = icon;
    svg.classList.add('visible');

    const status = document.getElementById(STATUS_ID);
    status.textContent = `${icon} ${gestureName}`;
    status.classList.add('visible');
  }

  function hideDwellProgress() {
    const svg = document.getElementById(PROGRESS_ID);
    if (svg) {
      svg.classList.remove('visible');
      const bar = svg.querySelector('.progress-bar');
      if (bar) bar.style.strokeDashoffset = '138.23';
    }
    const status = document.getElementById(STATUS_ID);
    if (status) status.classList.remove('visible');
  }

  let toastTimer = null;
  function showToast(message) {
    getOrCreateOverlay();
    const toast = document.getElementById(TOAST_ID);
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 1800);
  }

  function showVolumeStatus(volume) {
    getOrCreateOverlay();
    const status = document.getElementById(STATUS_ID);
    const pct  = Math.round(volume * 100);
    const bars = '█'.repeat(Math.round(volume * 8)) + '░'.repeat(8 - Math.round(volume * 8));
    status.textContent = `🤏 Ses: ${pct}%  ${bars}`;
    status.classList.add('visible');
  }

  function removeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    clearTimeout(toastTimer);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  E. MESSAGE LISTENER — Offscreen / Background Mesaj Dinleyicisi
  // ═══════════════════════════════════════════════════════════════════════════

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Mesajın işlendiğini onaylamak için hemen yanıt dön (connection hang önlemek için)
    const handleMessage = () => {
      // Kamera state
      if (message.type === 'CAMERA_STATE_CHANGED') {
        if (message.cameraOn) {
          getOrCreateOverlay();
          showToast('🖐 El Kontrolü Aktif');
        } else {
          removeOverlay();
        }
        return;
      }

      // Dwell progress
      if (message.type === 'GESTURE_DWELL') {
        updateDwellProgress(message.progress, message.icon, message.gestureName);
        return;
      }

      // Dwell reset
      if (message.type === 'GESTURE_RESET') {
        hideDwellProgress();
        return;
      }

      // Aksiyon tetikleme
      if (message.type === 'GESTURE_ACTION') {
        const video = getVideoElement();
        if (!video) return;

        const handler = ACTION_MAP[message.action];
        if (!handler) {
          console.warn('[HandControl] Atanmış eylem bulunamadı:', message.action);
          return;
        }

        console.log('[HandControl] Eylem yapıldı:', message.action);
        const feedback = handler(video, message);

        if (message.action === 'volumeControl') {
          showVolumeStatus(message.volume ?? video.volume);
          hideDwellProgress();
        } else if (feedback) {
          showToast(feedback);
          hideDwellProgress();
        }
      }
    };

    handleMessage();
    sendResponse({ status: 'ok' });
    return true; // Asenkron yanıt kanalı açık kalsın
  });

  // İlk yüklenmede kamera state'ini sorgula
  chrome.runtime.sendMessage({ type: 'GET_CAMERA_STATE' }, (response) => {
    if (response?.cameraOn) {
      getOrCreateOverlay();
      showToast('🖐 El Kontrolü Aktif');
    }
  });

})();
