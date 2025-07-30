# Randevu+ Projesi - Detaylı Yol Haritası ve Öğrenme Rehberi

## 📋 Proje Genel Bakış

**Proje Adı:** Randevu+ - Küçük İşletmeler için Online Randevu Sistemi  
**Teknoloji Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL, JWT  
**Hedef:** Küçük işletmeler için kullanıcı dostu randevu yönetim sistemi

## 🎯 Öğrenme Hedefleri

Bu proje ile öğrenecekleriniz:
- Next.js 15 App Router kullanımı
- TypeScript ile tip güvenli geliştirme
- JWT tabanlı kimlik doğrulama
- Prisma ORM ile veritabanı yönetimi
- Modern UI/UX tasarım prensipleri
- API tasarımı ve güvenlik
- Responsive web tasarımı

## 🗺️ Detaylı Yol Haritası

### Faz 1: Temel Yapı ve Veritabanı Tasarımı (1-2 gün)

#### 1.1 Veritabanı Şeması Tasarımı
**Öğrenme Hedefi:** Prisma ile veri modelleme
- **Kullanıcılar (Users)**
  - id, email, password, name, role (customer/business), createdAt
- **İşletmeler (Businesses)**
  - id, name, description, address, phone, ownerId, createdAt
- **Hizmetler (Services)**
  - id, businessId, name, duration, price, description
- **Randevular (Appointments)**
  - id, customerId, businessId, serviceId, date, time, status, notes

#### 1.2 Prisma Kurulumu ve Konfigürasyonu
```bash
# Prisma CLI kurulumu
npm install prisma --save-dev
npx prisma init
```

**Öğrenme Noktaları:**
- Prisma schema dosyası yapısı
- Veritabanı bağlantı konfigürasyonu
- Migration sistemi

### Faz 2: Kimlik Doğrulama Sistemi (2-3 gün)

#### 2.1 JWT Implementasyonu
**Öğrenme Hedefi:** JWT token yönetimi ve güvenlik
- JWT token oluşturma ve doğrulama
- Password hashing (bcryptjs)
- Middleware ile route koruması

#### 2.2 API Route'ları
- `/api/auth/register` - Kullanıcı kaydı
- `/api/auth/login` - Kullanıcı girişi
- `/api/auth/logout` - Çıkış
- `/api/auth/me` - Kullanıcı bilgileri

**Öğrenme Noktaları:**
- Next.js API Routes
- HTTP status kodları
- Error handling
- Input validation

### Faz 3: Kullanıcı Arayüzü (3-4 gün)

#### 3.1 Temel Sayfalar
- **Ana Sayfa** (`/`) - Sistem tanıtımı
- **Giriş/Kayıt** (`/auth`) - Kimlik doğrulama
- **Dashboard** (`/dashboard`) - Kullanıcı paneli
- **İşletme Profili** (`/business/[id]`) - İşletme detayları

#### 3.2 Bileşen Tasarımı
**Öğrenme Hedefi:** Modüler ve yeniden kullanılabilir bileşenler
- Header/Navigation
- Footer
- Form bileşenleri
- Modal/Dialog bileşenleri
- Loading states

### Faz 4: Randevu Sistemi (3-4 gün)

#### 4.1 Randevu Alma Süreci
- Hizmet seçimi
- Tarih/saat seçimi
- Randevu onaylama
- Email bildirimi

#### 4.2 Randevu Yönetimi
- Randevu listeleme
- Randevu durumu güncelleme
- Randevu iptal etme
- Geçmiş randevular

### Faz 5: İşletme Paneli (2-3 gün)

#### 5.1 İşletme Dashboard'u
- Gelen randevu talepleri
- Onay/red işlemleri
- Hizmet yönetimi
- İstatistikler

#### 5.2 Hizmet Yönetimi
- Hizmet ekleme/düzenleme
- Fiyatlandırma
- Çalışma saatleri

### Faz 6: Gelişmiş Özellikler (2-3 gün)

#### 6.1 Bildirim Sistemi
- Email bildirimleri
- In-app notifications
- SMS entegrasyonu (opsiyonel)

#### 6.2 Arama ve Filtreleme
- İşletme arama
- Hizmet filtreleme
- Konum bazlı arama

## 🛠️ Teknik Detaylar

### Klasör Yapısı
```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── appointments/
│   │   ├── businesses/
│   │   └── users/
│   ├── auth/
│   ├── dashboard/
│   ├── business/
│   └── globals.css
├── components/
│   ├── ui/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── utils.ts
├── types/
└── hooks/
```

### Güvenlik Önlemleri
- JWT token expiration
- Password hashing
- Input sanitization
- CORS konfigürasyonu
- Rate limiting

### Performance Optimizasyonları
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## 📚 Öğrenme Kaynakları

### Next.js
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js with TypeScript](https://nextjs.org/docs/basic-features/typescript)

### Prisma
- [Prisma Documentation](https://www.prisma.io/docs)
- [Database Schema Design](https://www.prisma.io/docs/concepts/components/prisma-schema)

### JWT
- [JWT.io](https://jwt.io/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

## 🎯 Geliştirme Süreci

### Her Faz İçin Önerilen Adımlar:
1. **Planlama** - Ne yapılacak?
2. **Tasarım** - Nasıl yapılacak?
3. **Implementasyon** - Kodlama
4. **Test** - Çalışıyor mu?
5. **Dokümantasyon** - Nasıl çalışıyor?

### Günlük Rutin:
- Sabah: Günlük hedefleri belirle
- Öğleden sonra: Kodlama ve test
- Akşam: Günlük değerlendirme ve planlama

## 🚀 Başlangıç Adımları

### 1. Proje Kurulumu (Tamamlandı ✅)
- Next.js projesi oluşturuldu
- Gerekli paketler kuruldu
- TypeScript konfigürasyonu yapıldı

### 2. Sonraki Adım: Veritabanı Tasarımı
- Prisma schema oluşturma
- İlk migration'ı çalıştırma
- Test verileri ekleme

## 💡 Öğrenme İpuçları

1. **Küçük Adımlarla İlerleyin** - Her seferinde bir özellik ekleyin
2. **Test Edin** - Her değişiklikten sonra test yapın
3. **Dokümante Edin** - Kodunuzu açıklayıcı yorumlarla yazın
4. **Hata Yapmaktan Korkmayın** - Hatalar öğrenmenin bir parçasıdır
5. **Stack Overflow Kullanın** - Sorun yaşadığınızda araştırın

## 📅 Tahmini Süre

**Toplam Süre:** 12-15 gün  
**Günlük Çalışma:** 2-4 saat  
**Hafta Sonu:** Daha yoğun çalışma

## 🎉 Başarı Kriterleri

Proje tamamlandığında şunları yapabileceksiniz:
- ✅ Kullanıcı kaydı ve girişi
- ✅ Randevu alma ve yönetimi
- ✅ İşletme paneli
- ✅ Responsive tasarım
- ✅ Güvenli API'ler
- ✅ Modern web teknolojileri

---

**Not:** Bu yol haritası esnek bir rehberdir. Kendi öğrenme hızınıza göre ayarlayabilirsiniz. Her adımda sorularınız olursa, detaylı açıklamalar yapabilirim. 