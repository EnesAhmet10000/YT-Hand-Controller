# YT Hand Control

[English](#en-english) | [Türkçe](#tr-türkçe) | [العربية](#ar-العربية)

---

<h2 id="en-english">🇬🇧 English</h2>

**YT Hand Control** is a next-generation Chrome Extension that allows you to control your YouTube playback entirely through hand gestures, using your webcam. No need to touch your keyboard or mouse while eating or watching from a distance!

### 🌟 Features
- **Smart Eating Mode (Food Mode) 🍿**: Enjoy your snacks without accidentally triggering gestures! Bring your index fingers towards each other (👉👈) to freeze all active gestures. Repeat the same gesture to awaken the system exactly as you left it.
- **Multi-User Profiles 👥**: Customizable gesture sets for different people using the same device. Each profile has its own name and memory configuration. Don't want your brother's settings to mess with yours? Just switch the profile!
- **Air Mouse Mode 🖱️**: Control the cursor with your hand and use gestures to simulate mouse clicks.
- **Multilingual Support 🌍**: Fully localized UI in English, Turkish, and Arabic (with sophisticated RTL interface engineering).
- **Camera Preview 📷**: Optional on-screen preview with full video or skeleton-only modes, completely draggable across the screen.

### ⚙️ Technical Details
- Powered by Google's **MediaPipe Hands** for highly accurate, browserless ML detection.
- Built on Chrome Extension **Manifest V3**.
- Utilizes the **Offscreen Document API** to bypass strict background script inactivity timeouts, ensuring a seamless and reliable background camera connection.
- Features flawless **RTL (Right-to-Left)** dynamic interface adjustments, showcasing high-level frontend engineering.

### 🚀 Installation
1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the folder containing the extension files.
5. Open a YouTube video and enjoy!

### 🖐️ Usage & Gestures

| Gesture | Icon | Default Action |
| :--- | :---: | :--- |
| **Both Hands Open** | 👐 | Toggle Fullscreen |
| **Both Index Up** | 🙌 | Increase Video Quality |
| **Both Index Down** | 👇👇 | Decrease Video Quality |
| **Open Palm** | ✋ | Play / Pause |
| **Index Up** | ☝️ | Volume Up (+5%) |
| **Index Down** | 👇 | Volume Down (-5%) |
| **Palm Right** | 🫱 | Speed Up (+0.25x) |
| **Palm Left** | 🫲 | Speed Down (-0.25x) |
| **Point Right** | 👉 | Seek Forward (10s) |
| **Point Left** | 👈 | Seek Backward (10s) |
| **Peace Sign** | ✌️ | Mute / Unmute |
| **Pinch** | 🤏 | Volume Control (Dynamic) |
| **Food Mode** | 👉👈 | Freeze / Unfreeze All Gestures |

*(All these actions are fully customizable via the popup menu, grouped under your personal profile!)*

### 📫 Contact
Created by Enes Ahmet. Feel free to connect or provide feedback via LinkedIn:
[Enes Ahmet on LinkedIn](https://www.linkedin.com/in/enesahmet10000)

---

<h2 id="tr-türkçe">🇹🇷 Türkçe</h2>

**YT Hand Control**, web kameranızı kullanarak YouTube videolarını tamamen el hareketlerinizle kontrol etmenizi sağlayan yeni nesil bir Chrome Eklentisidir. Uzaktan izlerken veya yemek yerken klavye veya fareye dokunmanıza gerek yok!

### 🌟 Özellikler
- **Smart Eating Mode (Yemek Modu) 🍿**: Cips veya yemek yerken kameranın yanlış tetiklenmesini önleyen akıllı dondurma özelliği. İşaret parmaklarınızı birbirine doğru tuttuğunuzda (👉👈) tüm hareketler uyku moduna geçer. Aynı hareketle sistemi tekrar eski ayarlarıyla uyandırabilirsiniz.
- **Çoklu Profil (Multi-User Profiles) 👥**: Aynı cihazı kullanan farklı kişiler için özelleştirilebilir el hareketi setleri. Her profil kendi ismine ve ayarlarına sahiptir. Başkasının ayarları sizinkini bozmasın!
- **Air Mouse Modu 🖱️**: Fare imlecini elinizle kontrol edin ve hareketlerinizle tıklamaları simüle edin.
- **Çoklu Dil Desteği 🌍**: İngilizce, Türkçe ve Arapça dillerinde tamamen yerelleştirilmiş arayüz.
- **Kamera Önizleme 📷**: Ekran üzerinde sürüklenebilir, "Tam Video" veya "Sadece İskelet" detaylarıyla ayarlanabilir opsiyonel vizör.

### ⚙️ Teknik Detaylar
- Yüksek doğruluklu makine öğrenimi tespiti için Google **MediaPipe Hands** altyapısını kullanır.
- Son nesil Chrome Extension **Manifest V3** standartlarına göre kodlanmıştır.
- Chrome'un arka plan uyku sürelerini aşmak ve kamerayı kesintisiz açık tutmak için **Offscreen Document API** mucizesini kullanır.
- Yüksek mühendislik çabası gerektiren **RTL (Sağdan Sola)** arayüz desteğine kusursuz uyum sağlar.

### 🚀 Kurulum
1. Bu depoyu (repository) indirin veya klonlayın.
2. Google Chrome'u açın ve adres çubuğuna `chrome://extensions/` yazın.
3. Sağ üst köşeden **Geliştirici modu** (Developer mode) seçeneğini aktifleştirin.
4. **Paketlenmemiş öğe yükle** butonuna tıklayın ve eklenti dosyalarının bulunduğu klasörü seçin.
5. Bir YouTube videosu açın ve keyfini çıkarın!

### 🖐️ Kullanım & Hareketler

| Hareket | İkon | Varsayılan İşlem |
| :--- | :---: | :--- |
| **Çift El Açık** | 👐 | Tam Ekran Aç/Kapat |
| **Çift İşaret Yukarı** | 🙌 | Kaliteyi Arttır |
| **Çift İşaret Aşağı** | 👇👇 | Kaliteyi Düşür |
| **Açık Avuç** | ✋ | Oynat / Duraklat |
| **İşaret Yukarı** | ☝️ | Sesi Aç (+%5) |
| **İşaret Aşağı** | 👇 | Sesi Kıs (-%5) |
| **Sağ Avuç** | 🫱 | Hızlandır (+0.25x) |
| **Sol Avuç** | 🫲 | Yavaşlat (-0.25x) |
| **Sağa İşaret** | 👉 | 10 Sn İleri Sar |
| **Sola İşaret** | 👈 | 10 Sn Geri Sar |
| **Zafer (V) İşareti** | ✌️ | Sesi Kapat / Aç |
| **Çimdik** | 🤏 | Dinamik Ses Kontrolü |
| **Yemek Modu** | 👉👈 | Tüm Hareketleri Dondur / Aç |

*(Tüm bu eylemler, profilinize kaydedilecek şekilde eklenti menüsünden serbestçe değiştirilebilir!)*

### 📫 İletişim
Enes Ahmet tarafından geliştirilmiştir. Geri bildirimleriniz ve bağlantı için LinkedIn:
[Enes Ahmet (LinkedIn)](https://www.linkedin.com/in/enesahmet10000)

---

<h2 id="ar-العربية">🇦🇪 العربية</h2>

**YT Hand Control** هي إضافة لمتصفح Chrome من الجيل التالي تتيح لك التحكم الكامل في تشغيل مقاطع فيديو YouTube من خلال إيماءات اليد باستخدام كاميرا الويب الخاصة بك. لا حاجة للمس لوحة المفاتيح أو الماوس أثناء تناول الطعام أو المشاهدة من مسافة بعيدة!

### 🌟 الميزات
- **وضع تناول الطعام الذكي (Smart Eating Mode) 🍿**: استمتع بوجباتك الخفيفة دون تشغيل الإيماءات عن طريق الخطأ! وجّه إصبعي السبابة نحو بعضهما البعض (👉👈) لتجميد جميع الإيماءات النشطة. كرر نفس الإيماءة لإيقاظ النظام تمامًا كما تركته.
- **ملفات شخصية متعددة للمستخدمين (Multi-User Profiles) 👥**: مجموعات إيماءات قابلة للتخصيص لأشخاص مختلفين يستخدمون نفس الجهاز. لكل ملف شخصي اسم خاص وذاكرة إعدادات مستقلة.
- **وضع الماوس الهوائي 🖱️**: تحكم في المؤشر بيدك واستخدم الإيماءات لمحاكاة نقرات الماوس.
- **دعم متعدد اللغات 🌍**: واجهة مستخدم مترجمة بالكامل إلى الإنجليزية والتركية والعربية.
- **معاينة الكاميرا 📷**: معاينة اختيارية على الشاشة مع أوضاع الفيديو الكامل أو الهيكل العظمي، قابلة للسحب في أي مكان على الشاشة.

### ⚙️ التفاصيل التقنية
- مدعوم بتقنية **MediaPipe Hands** من Google للكشف الدقيق عن حركات اليد.
- مبني على هندسة **Manifest V3** لإضافات Chrome.
- يستخدم واجهة **Offscreen Document API** لتجاوز قيود نوم الخلفية الصارمة، مما يضمن اتصال كاميرا موثوق دون انقطاع.
- يتميز بتعديلات واجهة الديناميكية لـ **RTL (من اليمين إلى اليسار)** مما يبرز هندسة الواجهات المتقدمة.

### 🚀 التثبيت
1. قم بتنزيل أو نسخ هذا المستودع.
2. افتح متصفح Google Chrome وانتقل إلى `chrome://extensions/`.
3. قم بتفعيل **وضع المطور (Developer mode)** في الزاوية العلوية اليمنى.
4. انقر على **تحميل حزمة غير معبأة (Load unpacked)** واختر المجلد الذي يحتوي على ملفات الإضافة.
5. افتح فيديو على YouTube واستمتع!

### 🖐️ الاستخدام والإيماءات

| الإيماءة | الرمز | الإجراء الافتراضي |
| :--- | :---: | :--- |
| **كلتا اليدين مفتوحتين** | 👐 | تبديل ملء الشاشة |
| **كلا السبابتين لأعلى** | 🙌 | زيادة الجودة |
| **كلا السبابتين لأسفل** | 👇👇 | تخفيض الجودة |
| **كف مفتوح** | ✋ | تشغيل / إيقاف مؤقت |
| **السبابة لأعلى** | ☝️ | رفع الصوت (+5%) |
| **السبابة لأسفل** | 👇 | خفض الصوت (-5%) |
| **الكف لليمين** | 🫱 | تسريع (+0.25x) |
| **الكف لليسار** | 🫲 | إبطاء (-0.25x) |
| **إشارة لليمين** | 👉 | تقديم 10 ثوان |
| **إشارة لليسار** | 👈 | تأخير 10 ثوان |
| **علامة النصر** | ✌️ | كتم / إلغاء الكتم |
| **قرصة** | 🤏 | التحكم بالصوت |
| **وضع الطعام** | 👉👈 | تجميد / تشغيل الإيماءات |

*(جميع هذه الإجراءات قابلة للتخصيص بالكامل عبر القائمة، وتُحفظ في ملفك الشخصي!)*

### 📫 التواصل
تم التطوير بواسطة أنس أحمد. لا تتردد في التواصل أو تقديم ملاحظاتك عبر LinkedIn:
[Enes Ahmet (LinkedIn)](https://www.linkedin.com/in/enesahmet10000)
