# Online Randevu Sistemi

Modern, Next.js tabanlı bir online randevu yönetim uygulaması. Müşteriler işletmelerden randevu alır, işletmeler ise çalışma saatlerini ve randevuları yönetir.

## 🚀 Özellikler (Özet)

- Müşteriler: İşletme arama, uygun saatleri görme, randevu oluşturma/iptal
- İşletmeler: Randevu onay/ret, çalışma saatleri ve randevu süresi yönetimi
- Dinamik uygun saat hesaplama (günlük randevu süreleriyle entegre)

## 🧰 Teknoloji Yığını

- Next.js 15, React 19, TypeScript, Tailwind CSS
- API Routes ile backend, SQLite veritabanı
- Kimlik doğrulama: JWT, şifreleme: bcrypt

## ⚙️ Hızlı Başlangıç

1) Bağımlılıklar
```bash
npm install
```

2) Veritabanı kurulumu
```bash
npm run setup-db
```

3) (İsteğe bağlı) Örnek veriler
```bash
npm run add-test-data
```

4) Geliştirme sunucusu
```bash
npm run dev
```

## 📦 Gereksinimler

- Node.js 20+
- npm 10+
- SQLite (dosya veritabanı; ekstra servis gerektirmez)

## 🔄 Temiz Kurulum / Sıfırlama

Sıfırdan başlamak veya veriyi temizlemek için:

```bash
git clean -fdX   # .gitignore ile izlenmeyen dosyaları (örn. sqlite.db) temizler
npm install
npm run setup-db
npm run add-test-data
```

## 👤 Test Hesapları

- Müşteri: `musteri@test.com` / `123456`
- Erkek Kuaförü: `kuafor@test.com` / `123456`
- Diş Kliniği: `dis@test.com` / `123456`

## 🔐 Ortam Değişkenleri (.env)

Projenin çalışması için aşağıdaki değişkenleri ayarlayın. Next.js için tercihen `.env.local` dosyasını kullanın.

```env
# Zorunlu
JWT_SECRET_KEY=super-gizli-ve-uzun-bir-anahtar-örn-64+karakter

# Opsiyonel
# PORT=3000
```


## 📄 Önemli Sayfalar ve API Uçları

- Sayfalar: `/businesses`, `/appointments/new`, `/business/settings`, `/profile`
- API: `/api/available-slots`, `/api/appointments`, `/api/business-hours`, `/api/businesses`


## 📝 Notlar

- Çalışma saatleri ve slot süresi (15–120 dk) günlük bazda yönetilebilir
- Randevu uygunlukları bu ayarlara göre gerçek zamanlı hesaplanır

