<div align="center">
  <img src="icons/icon128.png" alt="YT Hand Control Logo" width="128" />
  <h1>🖐️ YouTube Hand Control</h1>
  
  <p><b>MediaPipe</b> ve <b>Bilgisayarlı Görü</b> teknolojileri ile YouTube video oynatımını sadece el sallayarak kontrol edin.</p>

<a href="#özellikler">Özellikler</a> •
<a href="#kurulum">Kurulum</a> •
<a href="#hareketler">Hareketler</a> •
<a href="#kullanım-ve-menü">Kullanım ve Menü</a> •
<a href="#mimari">Mimari</a>

</div>

---

## 🌟 Genel Bakış

**YouTube Hand Control**, bilgisayarınızın kamerasını kullanarak YouTube videolarını bilimkurgu filmlerindeki gibi sadece el hareketlerinizle kontrol etmenizi (oynatma, duraklatma, ses, ileri-geri sarma, hızlandırma vb.) sağlayan bir Google Chrome eklentisidir. Arka planda Google'ın
**MediaPipe Hands** yapay zeka modelini kullanır.

En güzel yanı ne mi? %100 yerel (local) çalışır; yani görüntünüz hiçbir zaman bir bulut sunucusuna gönderilmez!

Elleriniz yemekten kirlenmiş de olsa, resim yaparken fırçayı bırakmak istemeseniz de ya da sadece kendinizi bir Jedi gibi hissetmek istediğinizde, bu eklenti kurtarıcınız olacak.

## ✨ Özellikler

- **Çift El ile Tam Ekran**: Her iki elinizi de kameraya açık bir şekilde 👐 göstererek sinematik bir deneyim için videoyu anında tam ekrana alın.

- **Gelişmiş Yatay Navigasyon**: Elinizi sağa veya sola işaret ederek videoyu 10 saniye ileri veya geri sarın, veya avuç içinizi döndürerek videolar arası kolayca geçiş yapın.

- **Trigonometrik Kararlılık & Kusursuz Algılama**: Eski nesil sistemleri tamamen çöpe attık. Artık elin kameraya olan uzaklığına veya açısına bakmaksızın, parmaklar arasındaki **Trigonometrik Açıyı (Math.atan2)** ve Öklid uzaklığını hesaplayan yepyeni bir "Orta Parmak Kilidi" (Middle Finger Lock) mantığı kurduk. İşaret etme (👉) ve Peace (✌️) gibi hareketler birbirine karışmıyor!

- **Midas Dokunuşu Koruması**: Yerleşik akıllı bekleme süresi ve özel "Cooldown" algoritmaları sayesinde sistem sadece _kasıtlı_ yapılan hareketlerinizi algılar. Kameranın önünden yanlışlıkla elinizi geçirdiniz diye videolar birbirine girmez.

- **Sıfır Gecikme & %100 Gizlilik**: Tüm yapay zeka süreçleri bir _Offscreen Document_ (Görünmez Belge) içinde kendi bilgisayarınızın işlemcisiyle çözülür. Kameranız sizi izleyip başkasına veri yollamaz; her şey bilgisayarınızda kalır.

- **Akıcı ve Çok Dilli Arayüz (I18N)**: YouTube ekranının üzerinde beliren o şık cam efeftli (glassmorphism) HUD bildirimleri, siz hareketleri yaptıkça size anlık tepkiler verir. Üstelik artık **Türkçe, İngilizce ve Arapça (RTL Destekli)**! Menüden dilinizi seçtiğiniz an, YouTube'un üzerindeki bildirimler ve menü harika bir simetriyle dilinize adapte olur.

- **Akıllı Güç Tasarrufu**: Eklentiyi menüsünden kapattığınız an tüm donanım anında serbest bırakılır ve bilgisayarınızda bir gram bile fazladan CPU harcamaz.
- **Air Mouse Modu (Sanal İmleç)**: İşaret ve başparmağınızı birleştirip (çimdik ucu), diğer üç parmağınızı açık tutarak elinizi bir fareye dönüştürün! Ekranda beliren sanal imleci elinizle yönlendirebilir ve otomatik sol tıklama işlemi (Dwell) yapabilirsiniz.
- **Gizlilik Odaklı Kamera Önizleme**: Pip (Picture-in-Picture) tarzı küçük bir ekranla el hareketlerinizin MediaPipe tarafından nasıl algılandığını canlı olarak YouTube üzerinde görebilirsiniz. Üstelik "Sadece İskelet" (Skeleton Only) moduyla yüzünüzü gizleyerek, sadece siyah arka plan üzerine çizilmiş el iskeletinizi izleyebilir ve gizliliğinizi koruyabilirsiniz.
- **Çimdikleyerek Ses Kontrolü (Önerilmez)**: İşaret parmağınızı ve başparmağınızı çimdikleyerek sesi dinamik olarak değiştirin. İki parmak arasındaki mesafe, ses seviyesini gerçek zamanlı olarak ayarlar.

## 🎯 Desteklenen Hareketler

| Hareket                | İkon  | Varsayılan Eylem       | Açıklama                                                                                                |
| :--------------------- | :---: | :--------------------- | :------------------------------------------------------------------------------------------------------ |
| **Çift El**            |  👐   | **Tam Ekran**          | İki elinizi açık ve yan yana tutarak videoyu tam ekran moduna geçirin veya çıkın.                       |
| **Çift İşaret Yukarı** |  🙌   | **Kaliteyi Arttır**    | İki elinizin de işaret parmağını havaya kaldırarak video kalitesini en yüksek (Maximum) seviyeye çeker. |
| **Çift İşaret Aşağı**  | 👇👇  | **Kalite Düşür**       | İki elinizin de işaret parmağını aşağı göstererek video kalitesini bir kademe düşürün.                  |
| **Çimdik (Önerilmez)** |  🤏   | **Gerçek Zamanlı Ses** | İşaret ile başparmağınızı birbirine yaklaştırarak sesi kısın ya da uzaklaştırarak açın.                 |
| **Açık El**            |  ✋   | **Oynat / Duraklat**   | Videoyu durdurmak veya oynatmak için düz ve açık bir el gösterin.                                       |
| **İşaret Yukarı**      |  ☝️   | **Sesi %5 Artır**      | Sadece işaret parmağınızı havaya kaldırarak videonun sesini azar azar yükseltin.                        |
| **İşaret Aşağı**       |  👇   | **Sesi %5 Azalt**      | Sadece işaret parmağınızı aşağı doğru göstererek videonun sesini azar azar kısın.                       |
| **Vulcan**             |  🖖   | **Sesi %5 Azalt**      | Meşhur Uzay Yolu (Spock) selamını vererek sesi azar azar kısın.                                         |
| **Sağ / Sol Avuç**     | 🫱/🫲 | **Hızlandır/Yavaşlat** | Avuç içinizi yana çevirerek videonun oynatma hızını ±0.25 oranında artırıp azaltın.                     |
| **Sağa / Sola İşaret** | 👉/👈 | **10 Sn İleri/Geri**   | İşaret parmağınızla yön belirterek videoyu hızlıca 10 saniye atlatın.                                   |
| **Zafer İşareti**      |  ✌️   | **Sesi Kapat / Aç**    | Sesin tamamen kapanmasını ya da açılmasını sağlamak için işaret ve orta parmağınızı "V" yapın.          |

_(Not: Bu eylemlerin tümü eklenti menüsündeki açılır listeler aracılığıyla kendi zevkinize göre değiştirilebilir)_

## 🎮 Kullanım ve Menü

Eklentiyi yükledikten sonra, Chrome araç çubuğunda el şeklindeki ikonumuza (🖐️) tıklayarak ana menüyü açabilirsiniz. Ana menü son derece anlaşılır ve özelleştirilebilir şekilde tasarlanmıştır:

### Ana Kontrol Anahtarı (Master Switch)

Menünün en üstünde yer alan anahtar, **Kamerayı ve Eklentiyi Aç/Kapat**manızı sağlar.

- **Açık Konum:** Kamera aktifleşir, MediaPipe motoru arkaplanda çalışmaya başlar ve YouTube'da el hareketlerinizi dinlemeye başlar.
- **Kapalı Konum:** Kamera tamamen kapanır, eklenti tüm donanım serbest bırakır ve işlemci tüketimini **Sıfır'a** indirir.

### Air Mouse Modu

Popup penceresindeki "Air Mouse Modu" anahtarını aktifleştirirseniz, el hareketlerinizle (işaret ve başparmak birleşikken) ekranda sanal bir fareyi kontrol edebilir ve dilediğiniz YouTube butonuna tıklayabilirsiniz.

### Hareket ve Eylem Özelleştirme

Kameranın altındaki listede 10 farklı el hareketini (Çift El, Açık El, İşaret Yukarı, Sağ/Sol Avuç, 👉/👈 vb.) göreceksiniz.

1. **Toggle/Switch Düğmesi:** İlgili hareketi tamamen devre dışı bırakmak veya tekrar açmak için kullanılır. Sevmediğiniz veya kazara kendi kendinize çok yaptığınız bir el hareketi varsa yanındaki düğmeden o hareketi susturabilirsiniz.
2. **Açılır Menü (Dropdown):** Her hareketin yanındaki açılır menüden, bu hareket yapıldığında YouTube'da hangi işlevin tetikleneceğini seçebilirsiniz. Örneğin "Yumruk" yaptığınızda "İleri Sar" yerine "Duraklat" işlevinin çalışmasını istiyorsanız açılır menüden özgürce ayarlayabilir, kendi favori düzeninizi yaratabilirsiniz.

_Seçtiğiniz tüm ayarlar Chrome belleğine otomatik kaydedilir; sekmeyi veya tarayıcıyı kapatsanız dahi eklenti tercihlerinizi hatırlar._

## 🚀 Kurulum (Geliştirici Modu)

Bu eklenti Chrome Web Mağazasında olmadığı için Geliştirici Modunu kullanarak saniyeler içinde Chrome'a yükleyebilirsiniz.

1. Projeyi bilgisayarınıza indirin (Clone):
   ```bash
   git clone https://github.com/EnesAhmet10000/YT-Hand-Controller.git
   ```
2. Google Chrome'u açın ve adres çubuğuna `chrome://extensions/` yazın.
3. Sağ üst köşedeki **Geliştirici Modu (Developer mode)** butonunu aktif hale getirin.
4. Sol üstteki **Paketlenmemiş öğe yükle (Load unpacked)** düğmesine tıklayın.
5. Klasörü indirdiğiniz `YT-Hand-Controller` dizinini seçin.
6. Eklentiniz artık kuruldu! Dilerseniz adres çubuğunun yanındaki yapboz (🧩) simgesinden eklentiyi sabitleyebilirsiniz.

## ⚙️ Nasıl Çalışıyor? (Mimari)

En güncel **Manifest V3** standartlarıyla inşa edilen eklenti, üçlü bir mimariye sahiptir:

- **`background.js` (Service Worker)**: Eklentinin beynidir. Kameranın Açık/Kapalı durumunu yönetir ve "Görünmez Sürücü (Offscreen)" belgesini hayatta tutmak için sürekli bir `KEEP_ALIVE` nabzı gönderir.
- **`offscreen.js` (Görünmez Sürücü)**: Ağır işlerin yapıldığı kısımdır. Kameraya erişir, MediaPipe WebAssembly'i yükler ve ~30 FPS hızda el hareketlerini yüksek doğrulukla arka planda hesaplar. Duruş bozukluklarını (derinlik / uzaklık) ekarte etmek için x ekseni sapmalarını değil doğrudan bilek-parmak arasındaki eksen açısını **(Trigonometri ile)** hesaplayan güncel bir algoritmaya sahiptir.
- **`content.js` (İçerik Betiği)**: Doğrudan YouTube sayfasının içine yerleşir. Olayları dinler, YouTube'un HTML5 `<video>` elementine müdahale ederek eylemleri yansıtır ve size o şık kullanıcı arayüzünü (Toast, Progress vb.) çizer.

## 🆕 Son Güncellemeler (Latest Updates)

- **Çoklu Dil Desteği (I18N):** Popup arayüzüne dil seçimi (Türkçe, İngilizce, Arapça) eklendi ve RTL desteği sağlandı.
- **Air Mouse Özelliği:** Sanal imleç desteği getirilerek, eklentiyi sadece videoyu değil tüm arayüzü kontrol edecek şekle dönüştürme adımları atıldı.
- **Gelişmiş Hareketler ve Çözünürlük Kontrolü:** "İşaret Aşağı (👇👇/👇)" hareketleri eklendi. Artık el hareketlerinizle videonun kalitesini dinamik bir şekilde yükseltebilir veya kademeli olarak düşürebilirsiniz.
- **Duyarlı Yapay Zeka Tıklaması:** Eklenti artık YouTube kalite listesini ve seçeneklerini analiz ederek, her zaman en doğru `p` (örn: 1080p, 720p) seçeneğini bularak hatasız ayar değişikliği yapıyor.
- **Tam Senkronizasyon (Durum Yönetimi):** Kamera Açık/Kapalı durumu artık arkaplan (background.js), görünmez sayfa (offscreen.js) ve menü (popup.html) arasında kusursuz bir şekilde senkronize çalışıyor.
- **Gizlilik Odaklı Kamera Önizleme:** YouTube izlerken hareketlerinizi kontrol edebilmeniz için kameranızı mini bir ekranda yansıtan bildirim ekranı (Preview) ve yüzünüzü maskeleyerek gizliliğinizi en üst düzeye çıkaran "Sadece İskelet" modu sisteme dâhil edildi.
- **Hata Düzeltmeleri & İyileştirmeler:** İşaret parmağı (👉/👈) ve Barış (✌️) işareti arasındaki algılama sorunları katı kurallarla çözüldü, WebGL hataları giderildi.

## 🤝 Katkıda Bulunma

Projeyi geliştirmeye, hataları (issues) bildirmeye veya yeni özellikler eklemeye sonuna kadar açığız. Bir yıldız (⭐️) vermeyi unutmayın!

---

<div align="center">
  <i>"Multimedya için dokunmasız bir gelecek."</i>
</div>
# YT-Hand-Controller
