# Online Randevu Sistemi

Modern ve kullanıcı dostu bir online randevu yönetim sistemi. Bu proje, işletmelerin randevu almalarını ve müşterilerin kolayca randevu oluşturmalarını sağlar.

## 🚀 Özellikler

### Müşteriler için:
- Kolay randevu oluşturma
- Mevcut randevuları görüntüleme
- Randevu geçmişi
- Profil yönetimi

### İşletmeler için:
- Randevu yönetimi
- Çalışma saatleri ayarlama
- Randevu onaylama/reddetme
- İstatistik görüntüleme
- Profil ve ayar yönetimi

### Genel özellikler:
- JWT tabanlı kimlik doğrulama
- Responsive tasarım
- Modern UI/UX
- Gerçek zamanlı güncellemeler

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Veritabanı**: SQLite
- **Kimlik Doğrulama**: JWT, bcrypt
- **Form Yönetimi**: React Hook Form
- **UI Bileşenleri**: Headless UI, Heroicons

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn

## 🚀 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd Online-Randevu-Sistemi
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. Environment Variables Oluşturun
Proje ana dizininde `.env.local` dosyası oluşturun:
```env
JWT_SECRET_KEY=your-super-secret-jwt-key-here-12345
```

### 4. Veritabanını Kurun
```bash
# Veritabanı tablolarını oluştur
npm run setup-db

# Test verisi ekle (opsiyonel)
npm run add-test-data
```

### 5. Development Server'ı Başlatın
```bash
npm run dev
# veya
yarn dev
```

### 6. Tarayıcıda Açın
[http://localhost:3000](http://localhost:3000) adresini açın.

## 🔑 Test Hesapları

Eğer test verisi eklediyseniz:

- **Müşteri Hesabı:** `ahmet@test.com` / `123456`
- **İşletme Hesabı:** `ayse@test.com` / `123456`

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoint'leri
│   │   ├── appointments/   # Randevu API'leri
│   │   ├── auth/          # Kimlik doğrulama API'leri
│   │   ├── business/      # İşletme API'leri
│   │   └── ...
│   ├── appointments/       # Randevu sayfaları
│   ├── business/          # İşletme paneli
│   ├── login/             # Giriş sayfası
│   ├── register/          # Kayıt sayfası
│   └── profile/           # Profil sayfası
├── lib/                   # Yardımcı fonksiyonlar
│   ├── auth.js           # Kimlik doğrulama
│   ├── sqlite.js         # Veritabanı bağlantısı
│   └── validation.ts     # Form doğrulama
└── middleware.js          # Next.js middleware
```

## 🔧 Kullanılabilir Scriptler

- `npm run dev` - Geliştirme sunucusunu başlatır
- `npm run build` - Production build oluşturur
- `npm run start` - Production sunucusunu başlatır
- `npm run lint` - ESLint ile kod kontrolü yapar
- `npm run setup-db` - Veritabanı kurulumu yapar
- `npm run add-test-data` - Test verisi ekler

## 🌐 API Endpoint'leri

### Kimlik Doğrulama
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/logout` - Çıkış yapma
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri

### Randevular
- `GET /api/appointments` - Randevuları listele
- `POST /api/appointments` - Yeni randevu oluştur
- `GET /api/appointments/[id]` - Belirli randevuyu getir
- `PUT /api/appointments/[id]` - Randevu güncelle

### İşletme Yönetimi
- `GET /api/business/profile` - İşletme profili
- `PUT /api/business/profile` - Profil güncelle
- `GET /api/business/appointments` - İşletme randevuları
- `GET /api/business-hours` - Çalışma saatleri

### Test ve Debug
- `GET /api/test-sqlite?action=migrate` - Migration çalıştır
- `GET /api/test-sqlite?action=test` - Bağlantı test et
- `GET /api/test-sqlite?action=stats` - İstatistikleri getir
- `GET /api/test-sqlite?action=tables` - Tablo yapılarını getir

## 🗄️ Veritabanı

### Tablolar
- **users** - Kullanıcı bilgileri
- **businesses** - İşletme bilgileri  
- **appointments** - Randevu bilgileri
- **migrations** - Migration kayıtları

### Veritabanı Dosyası
- `sqlite.db` - SQLite veritabanı dosyası
- Otomatik olarak oluşturulur

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Şifre hash'leme (bcrypt)
- Güvenli HTTP-only cookie'ler
- Middleware ile korumalı rotalar
- Environment variable ile secret key yönetimi

## 🎨 Tasarım

- Modern ve temiz arayüz
- Tailwind CSS ile responsive tasarım
- Gradient arka planlar
- Smooth animasyonlar
- Mobil uyumlu tasarım

## 📱 Responsive Tasarım

Proje tüm cihazlarda mükemmel çalışacak şekilde tasarlanmıştır:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm run build
vercel --prod
```

### Diğer Platformlar
```bash
npm run build
npm run start
```

## 🐛 Sorun Giderme

### JWT Secret Key Hatası
```
Error: JWT Secret key is not matched
```

**Çözüm:** `.env.local` dosyasında `JWT_SECRET_KEY` tanımlayın.

### Veritabanı Bağlantı Hatası
**Çözüm:** `npm run setup-db` komutunu çalıştırın.

### Test Verisi Ekleme
**Çözüm:** `npm run add-test-data` komutunu çalıştırın.

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue oluşturun
- Email: [your-email@example.com]

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynak projeleri kullanmaktadır:
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLite](https://www.sqlite.org/)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
