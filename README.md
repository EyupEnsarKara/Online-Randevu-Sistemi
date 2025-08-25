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

## 📜 Komutlar (Scripts)

- `npm run setup-db`: SQLite kurulum
- `npm run add-test-data`: Örnek veri ekleme
- `npm run add-business-hours`: Örnek çalışma saatleri
- `npm run test-business-hours`: Slot hesap testleri

## 📝 Notlar

- Çalışma saatleri ve slot süresi (15–120 dk) günlük bazda yönetilebilir
- Randevu uygunlukları bu ayarlara göre gerçek zamanlı hesaplanır

## 📄 Lisans

MIT
