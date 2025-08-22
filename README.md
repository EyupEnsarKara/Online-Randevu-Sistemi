# Online Randevu Sistemi

Modern ve kullanıcı dostu online randevu yönetim sistemi.

## 🚀 Özellikler

### Müşteriler için:
- İşletmelerden randevu alma
- Randevu geçmişi görüntüleme
- Randevu iptal etme
- İşletme arama ve filtreleme

### İşletmeler için:
- Randevu taleplerini onaylama/reddetme
- Takvim görünümünde randevu yönetimi
- Çalışma saatleri ayarlama
- **YENİ: Randevu arası süre ayarlama (15dk, 30dk, 45dk, 1s, 1.5s, 2s)**
- **YENİ: Günlük slot duration yönetimi**

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Veritabanı**: SQLite
- **Kimlik Doğrulama**: JWT
- **Şifreleme**: bcrypt

## 📦 Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Veritabanını kurun:**
```bash
npm run setup-db
```

3. **Test verilerini ekleyin (isteğe bağlı):**
```bash
npm run add-test-data
```

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

## 🔧 Yeni Özellikler

### Slot Duration Yönetimi
İşletmeler artık her gün için farklı randevu arası süreleri ayarlayabilir:

- **Genel Ayar**: Tüm açık günler için tek seferde slot duration ayarlama
- **Günlük Ayar**: Her gün için ayrı slot duration belirleme
- **Desteklenen Süreler**: 15dk, 30dk, 45dk, 1s, 1.5s, 2s

### Çalışma Saatleri Yönetimi
- Her gün için açık/kapalı durumu
- Başlangıç ve bitiş saatleri
- Slot duration ile entegre çalışma

## 🗄️ Veritabanı Şeması

### business_hours tablosu
```sql
CREATE TABLE business_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Pazar, 1=Pazartesi, ...
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_working_day BOOLEAN DEFAULT 1,
  slot_duration INTEGER DEFAULT 30, -- dakika cinsinden
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);
```

## 🔄 Migration

Yeni özellikler için veritabanı migration'ı:

```bash
# Test endpoint üzerinden migration çalıştırma
curl "http://localhost:3000/api/test-sqlite?action=migrate"

# Veritabanı durumunu kontrol etme
curl "http://localhost:3000/api/test-sqlite?action=stats"

# Business hours tablosunu kontrol etme
curl "http://localhost:3000/api/test-sqlite?action=business-hours"
```

## 📱 Kullanım

### İşletme Ayarları
1. `/business/settings` sayfasına gidin
2. Genel slot duration ayarlayın
3. Her gün için çalışma saatleri ve slot duration belirleyin
4. Ayarları kaydedin

### Randevu Alma
1. `/appointments/new` sayfasına gidin
2. İşletme seçin
3. Tarih seçin (sadece çalışma günleri)
4. Müsait saatlerden birini seçin (slot duration'a göre hesaplanır)
5. Randevuyu oluşturun

## 🧪 Test

Sistem test edildi ve şu özellikler çalışıyor:

- ✅ Çalışma saatleri kaydetme
- ✅ Slot duration ayarlama
- ✅ Randevu slot'ları hesaplama
- ✅ Günlük slot duration yönetimi
- ✅ Veritabanı entegrasyonu

## 📝 Notlar

- Slot duration değişiklikleri mevcut randevuları etkilemez
- Çalışma saatleri değişiklikleri anında yansır
- Sistem 24 saat formatında çalışır
- Tarih formatı: YYYY-MM-DD

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
