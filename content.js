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

  const I18N = {
    tr: {
      play: '▶ Oynatılıyor', pause: '⏸ Duraklatıldı', speed: 'Hız',
      mute: '🔇 Ses Kapatıldı', unmute: '🔊 Ses Açıldı',
      fw5: '⏩ 5 Sn İleri', bw5: '⏪ 5 Sn Geri', fw10: '⏩ +10s', bw10: '⏪ -10s',
      next: '⏭ Sonraki Video', prev: '⏮ Önceki Video',
      fsOn: '📺 Tam Ekran', fsOff: '📱 Normal Ekran', vol: 'Ses',
      active: '🖐 El Kontrolü Aktif',
      Both_Hands: 'Çift El', Both_Index_Up: 'Çift İşaret Yukarı', Both_Index_Down: 'Çift İşaret Aşağı', Open_Palm: 'Açık El', Index_Up: 'İşaret Yukarı', Index_Down: 'İşaret Aşağı',
      Palm_Right: 'Sağ Avuç', Palm_Left: 'Sol Avuç', Pointing_Right: 'Sağa İşaret',
      Pointing_Left: 'Sola İşaret', Peace_Sign: 'Zafer', Pinch_Volume: 'Çimdik',
      leftClick: 'Sol Tıklandı', setMaxQuality: 'Kalite Arttırılıyor...', decreaseQualityOneStep: 'Kalite Düşürülüyor...', minQuality: 'Minimum Kalite'
    },
    en: {
      play: '▶ Playing', pause: '⏸ Paused', speed: 'Speed',
      mute: '🔇 Muted', unmute: '🔊 Unmuted',
      fw5: '⏩ Forward 5s', bw5: '⏪ Backward 5s', fw10: '⏩ +10s', bw10: '⏪ -10s',
      next: '⏭ Next Video', prev: '⏮ Previous Video',
      fsOn: '📺 Fullscreen', fsOff: '📱 Normal Screen', vol: 'Volume',
      active: '🖐 Hand Control Active',
      Both_Hands: 'Both Hands', Both_Index_Up: 'Both Index Up', Both_Index_Down: 'Both Index Down', Open_Palm: 'Open Palm', Index_Up: 'Index Up', Index_Down: 'Index Down',
      Palm_Right: 'Palm Right', Palm_Left: 'Palm Left', Pointing_Right: 'Point Right',
      Pointing_Left: 'Point Left', Peace_Sign: 'Peace Sign', Pinch_Volume: 'Pinch',
      leftClick: 'Left Click', setMaxQuality: 'Increasing Quality...', decreaseQualityOneStep: 'Decreasing Quality...', minQuality: 'Minimum Quality'
    },
    ar: {
      play: '▶ تشغيل', pause: '⏸ إيقاف مؤقت', speed: 'السرعة',
      mute: '🔇 تم الكتم', unmute: '🔊 إلغاء الكتم',
      fw5: '⏩ تقديم 5 ثوان', bw5: '⏪ تأخير 5 ثوان', fw10: '⏩ +10 ثوان', bw10: '⏪ -10 ثوان',
      next: '⏭ الفيديو التالي', prev: '⏮ الفيديو السابق',
      fsOn: '📺 ملء الشاشة', fsOff: '📱 شاشة عادية', vol: 'الصوت',
      active: '🖐 التحكم باليد نشط',
      Both_Hands: 'كلتا اليدين', Both_Index_Up: 'كلا السبابتين لأعلى', Both_Index_Down: 'كلا السبابتين لأسفل', Open_Palm: 'كف مفتوح', Index_Up: 'السبابة لأعلى', Index_Down: 'السبابة لأسفل',
      Palm_Right: 'الكف لليمين', Palm_Left: 'الكف لليسار', Pointing_Right: 'إشارة لليمين',
      Pointing_Left: 'إشارة لليسار', Peace_Sign: 'علامة النصر', Pinch_Volume: 'قرصة',
      leftClick: 'تم النقر', setMaxQuality: 'جاري زيادة الجودة...', decreaseQualityOneStep: 'جاري تخفيض الجودة...', minQuality: 'في أدنى جودة'
    }
  };
  let currentLang = 'tr';

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
      return video.paused ? I18N[currentLang].pause : I18N[currentLang].play;
    },
    speedUp: (video) => {
      video.playbackRate = Math.min(video.playbackRate + 0.25, 3.0);
      return `⚡ ${I18N[currentLang].speed}: ${video.playbackRate.toFixed(2)}x`;
    },
    speedDown: (video) => {
      video.playbackRate = Math.max(video.playbackRate - 0.25, 0.25);
      return `🐢 ${I18N[currentLang].speed}: ${video.playbackRate.toFixed(2)}x`;
    },
    toggleMute: (video) => {
      video.muted = !video.muted;
      return video.muted ? I18N[currentLang].mute : I18N[currentLang].unmute;
    },
    volumeUp5: (video) => {
      video.volume = Math.min(1.0, video.volume + 0.05);
      return `🔊 ${I18N[currentLang].vol}: %${Math.round(video.volume * 100)}`;
    },
    volumeDown5: (video) => {
      video.volume = Math.max(0.0, video.volume - 0.05);
      return `🔉 ${I18N[currentLang].vol}: %${Math.round(video.volume * 100)}`;
    },
    seekForward: (video) => {
      video.currentTime = Math.min(video.currentTime + 5, video.duration);
      return I18N[currentLang].fw5;
    },
    seekBackward: (video) => {
      video.currentTime = Math.max(video.currentTime - 5, 0);
      return I18N[currentLang].bw5;
    },
    seekForward10: (video) => {
      video.currentTime += 10;
      return I18N[currentLang].fw10;
    },
    seekBackward10: (video) => {
      video.currentTime -= 10;
      return I18N[currentLang].bw10;
    },
    nextVideo: (video) => {
      const nextBtn = document.querySelector('.ytp-next-button');
      if (nextBtn) nextBtn.click();
      return I18N[currentLang].next;
    },
    previousVideo: (video) => {
      const prevBtn = document.querySelector('.ytp-prev-button');
      if (prevBtn && prevBtn.style.display !== 'none') {
        prevBtn.click();
      } else {
        window.history.back();
      }
      return I18N[currentLang].prev;
    },

    toggleFullscreen: (video) => {
      const fullScreenBtn = document.querySelector('.ytp-fullscreen-button');
      if (fullScreenBtn) {
        fullScreenBtn.click();
        const isNowFull = fullScreenBtn.getAttribute('title')?.includes('Çık') || fullScreenBtn.getAttribute('title')?.includes('Exit') || document.fullscreenElement;
        return isNowFull ? I18N[currentLang].fsOn : I18N[currentLang].fsOff;
      }
      return null;
    },
    volumeControl: (video, data) => {
      if (data && data.volume !== undefined) {
        video.volume = data.volume;
      }
      return null; // Volume UI ayrı yönetilir
    },
    mouseClick: (video) => {
      const elem = document.elementFromPoint(currentMouseX, currentMouseY);
      if (elem) {
        if (typeof elem.click === 'function') {
          elem.click();
        } else {
          const evnt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
          elem.dispatchEvent(evnt);
        }
      }
      if (virtualCursor) {
        virtualCursor.classList.add('click-anim');
        setTimeout(() => virtualCursor.classList.remove('click-anim'), 200);
      }
      return I18N[currentLang].leftClick;
    },
    setMaxQuality: (video) => {
      const settingsBtn = document.querySelector('.ytp-settings-button');
      if (!settingsBtn) return null;
      settingsBtn.click();
      
      setTimeout(() => {
        const menuItems = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'));
        let qualityBtn = menuItems.find(item => item.innerText.match(/Quality|Kalite|الجودة|Qualité|Kvalitet|\d+p/i));
        if (!qualityBtn && menuItems.length > 0) qualityBtn = menuItems[menuItems.length - 1]; 
        
        if (qualityBtn) {
          qualityBtn.click();
          setTimeout(() => {
            const allOptions = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem[role="menuitemradio"]'));
            // Otomatik (Auto) seçeneğini tamamen listeden filtrele, sadece gerçek "p" değerlerini al.
            const pOptions = allOptions.filter(opt => opt.innerText.match(/\d+p/i) && !opt.innerText.match(/Auto|Otomatik|تلقائي/i));
            
            if (pOptions.length > 0) {
              const checkedOpt = allOptions.find(opt => opt.getAttribute('aria-checked') === 'true');
              let currentIndex = -1;
              
              // Eğer seçili olan seçenek "Auto (720p)" gibi bir şeyse, içindeki sayıyı alıp gerçek "720p" öğesinin sırasını bul.
              if (checkedOpt) {
                if (checkedOpt.innerText.match(/Auto|Otomatik|تلقائي/i)) {
                   const match = checkedOpt.innerText.match(/(\d+)p/i);
                   if (match) currentIndex = pOptions.findIndex(opt => opt.innerText.includes(match[1] + 'p'));
                } else {
                   currentIndex = pOptions.indexOf(checkedOpt);
                }
              }
              
              if (currentIndex === -1) {
                currentIndex = Math.floor(pOptions.length / 2);
              }

              // Liste yüksekten düşüğe sıralı olduğu için, "Artır" = İndeksi 1 azalt
              const targetIndex = Math.max(0, currentIndex - 1);
              
              if (pOptions[targetIndex]) {
                pOptions[targetIndex].click();
              } else {
                settingsBtn.click(); // Zaten maksimumdaysa kapat
              }
            } else {
               settingsBtn.click(); 
            }
          }, 320); // YouTube arayüzü bazen geç açıldığı için süreyi ufak artırdık
        } else {
          settingsBtn.click();
        }
      }, 320);
      return I18N[currentLang].setMaxQuality;
    },
    decreaseQualityOneStep: (video) => {
      const settingsBtn = document.querySelector('.ytp-settings-button');
      if (!settingsBtn) return null;
      settingsBtn.click();
      
      setTimeout(() => {
        const menuItems = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'));
        let qualityBtn = menuItems.find(item => item.innerText.match(/Quality|Kalite|الجودة|Qualité|Kvalitet|\d+p/i));
        if (!qualityBtn && menuItems.length > 0) qualityBtn = menuItems[menuItems.length - 1]; 
        
        if (qualityBtn) {
          qualityBtn.click();
          setTimeout(() => {
            const allOptions = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem[role="menuitemradio"]'));
            // Otomatik (Auto) seçeneğini tamamen listeden filtrele
            const pOptions = allOptions.filter(opt => opt.innerText.match(/\d+p/i) && !opt.innerText.match(/Auto|Otomatik|تلقائي/i));
            
            if (pOptions.length > 0) {
              const checkedOpt = allOptions.find(opt => opt.getAttribute('aria-checked') === 'true');
              let currentIndex = -1;
              
              if (checkedOpt) {
                if (checkedOpt.innerText.match(/Auto|Otomatik|تلقائي/i)) {
                   const match = checkedOpt.innerText.match(/(\d+)p/i);
                   if (match) currentIndex = pOptions.findIndex(opt => opt.innerText.includes(match[1] + 'p'));
                } else {
                   currentIndex = pOptions.indexOf(checkedOpt);
                }
              }
              
              if (currentIndex === -1) {
                currentIndex = Math.floor(pOptions.length / 2);
              }

              // Liste yüksekten düşüğe doğru (örn: 1080p, 720p, 480p). "Düşür" = İndeksi 1 ARTIR
              const targetIndex = currentIndex + 1;
              
              if (targetIndex < pOptions.length) {
                pOptions[targetIndex].click();
              } else {
                settingsBtn.click(); // En alt kalitedeysek menüyü kapat
                showToast(I18N[currentLang].minQuality); // En düşük kalite uyarısı ver
              }
            } else {
               settingsBtn.click(); 
            }
          }, 320);
        } else {
          settingsBtn.click();
        }
      }, 320);
      return I18N[currentLang].decreaseQualityOneStep;
    },
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //  C. OVERLAY UI & VIRTUAL CURSOR — DOM Enjeksiyonları
  // ═══════════════════════════════════════════════════════════════════════════

  let virtualCursor = null;
  let targetMouseX = window.innerWidth / 2;
  let targetMouseY = window.innerHeight / 2;
  let currentMouseX = window.innerWidth / 2;
  let currentMouseY = window.innerHeight / 2;
  let mouseHideTimer = null;

  function initVirtualCursor() {
    if (document.getElementById('yt-virtual-cursor')) return;
    virtualCursor = document.createElement('div');
    virtualCursor.id = 'yt-virtual-cursor';
    virtualCursor.innerHTML = `
      <style>
        #yt-virtual-cursor {
          position: fixed;
          top: 0; left: 0;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: rgba(108, 92, 231, 0.85);
          backdrop-filter: blur(4px);
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          pointer-events: none;
          z-index: 9999999;
          transform: translate(-50%, -50%);
          display: none;
        }
        #yt-virtual-cursor.click-anim {
          background: #ff7675;
          transform: translate(-50%, -50%) scale(0.6);
          transition: transform 0.15s ease, background 0.15s ease;
        }
      </style>
    `;
    document.body.appendChild(virtualCursor);
    requestAnimationFrame(renderCursor);
  }

  function renderCursor() {
    if (!virtualCursor) return;
    currentMouseX += (targetMouseX - currentMouseX) * 0.3;
    currentMouseY += (targetMouseY - currentMouseY) * 0.3;

    virtualCursor.style.left = currentMouseX + 'px';
    virtualCursor.style.top = currentMouseY + 'px';

    requestAnimationFrame(renderCursor);
  }

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
    const translatedName = I18N[currentLang][gestureName] || gestureName;
    status.textContent = `${icon} ${translatedName}`;
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
    status.textContent = `🤏 ${I18N[currentLang].vol}: ${pct}%  ${bars}`;
    status.classList.add('visible');
  }

  function removeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    clearTimeout(toastTimer);
  }

  let previewContainer = null;
  let previewImage = null;

  function getOrCreatePreview() {
    if (previewContainer) return previewContainer;

    previewContainer = document.createElement('div');
    previewContainer.id = 'yt-handcontrol-preview-container';
    previewContainer.innerHTML = `
      <style>
        #yt-handcontrol-preview-container {
          position: fixed;
          top: 80px;
          left: 20px;
          width: 240px;
          height: 180px;
          border-radius: 12px;
          border: 4px solid rgba(108, 92, 231, 0.8);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          background-color: #000;
          z-index: 999999;
          overflow: hidden;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        #yt-handcontrol-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      </style>
      <img id="yt-handcontrol-preview-img" src="" />
    `;
    document.body.appendChild(previewContainer);
    previewImage = previewContainer.querySelector('#yt-handcontrol-preview-img');
    return previewContainer;
  }

  function updatePreviewFrame(dataUrl) {
    getOrCreatePreview();
    if (previewImage) {
      previewImage.src = dataUrl;
    }
  }

  function hidePreviewFrame() {
    if (previewContainer) {
      previewContainer.remove();
      previewContainer = null;
      previewImage = null;
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  E. MESSAGE LISTENER — Offscreen / Background Mesaj Dinleyicisi
  // ═══════════════════════════════════════════════════════════════════════════

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Mesajın işlendiğini onaylamak için hemen yanıt dön (connection hang önlemek için)
    const handleMessage = () => {
      // Air Mouse
      if (message.type === 'MOUSE_MOVE') {
        if (!virtualCursor) {
          initVirtualCursor();
        }
        virtualCursor.style.display = 'block';
        
        targetMouseX = message.x * window.innerWidth;
        targetMouseY = message.y * window.innerHeight;
        
        clearTimeout(mouseHideTimer);
        mouseHideTimer = setTimeout(() => {
           if (virtualCursor) virtualCursor.style.display = 'none';
        }, 1500);
        return;
      }

      if (message.type === 'MOUSE_CLICK') {
         if (virtualCursor) {
           virtualCursor.classList.add('click-anim');
           setTimeout(() => virtualCursor.classList.remove('click-anim'), 200);
         }
         
         const elem = document.elementFromPoint(currentMouseX, currentMouseY);
         if (elem) {
           if (typeof elem.click === 'function') {
             elem.click();
           } else {
             const evnt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
             elem.dispatchEvent(evnt);
           }
         }
         return;
      }

      // Kamera state
      if (message.type === 'CAMERA_STATE_CHANGED') {
        if (message.cameraOn) {
          getOrCreateOverlay();
          showToast(I18N[currentLang].active);
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

      // Preview frame alımı
      if (message.type === 'PREVIEW_FRAME') {
        updatePreviewFrame(message.data);
        return;
      }

      // Preview kapatıldı mesajı
      if (message.type === 'PREVIEW_CLOSED') {
        hidePreviewFrame();
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

  // Storage dinleyici - Dil değişikliğine hemen tepki ver
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.language) {
      currentLang = changes.language.newValue;
    }
    if (namespace === 'local' && changes.previewEnabled) {
      if (!changes.previewEnabled.newValue) hidePreviewFrame();
    }
  });

  // İlk yüklenmede kamera state'ini sorgula ve dili bağla
  chrome.storage.local.get({ language: 'tr' }, (data) => {
    currentLang = data.language;
    chrome.runtime.sendMessage({ type: 'GET_CAMERA_STATE' }, (response) => {
      if (response?.cameraOn) {
        getOrCreateOverlay();
        showToast(I18N[currentLang].active);
      }
    });
  });

})();
