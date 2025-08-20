'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'customer' | 'business';
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
            cancelled: 0
  });

  useEffect(() => {
    // JWT token'dan kullanıcı bilgilerini al
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          
          // İstatistikleri yükle
          const statsResponse = await fetch('/api/stats', {
            credentials: 'include'
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success) {
              setStats(statsData.stats);
            }
          }
        } else {
          // Giriş yapmamış kullanıcıyı login sayfasına yönlendir
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Randevu+</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hoş geldin, {user.name}</span>
              <Link
                href="/profile"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Profil
              </Link>
              {/* İşletme Ayarları bağlantısı header'dan kaldırıldı */}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hoş Geldiniz, {user.name}! 👋
            </h2>
            <p className="text-gray-600 text-lg">
              {user.user_type === 'customer' 
                ? 'Randevu almak için aşağıdaki seçenekleri kullanabilirsiniz.'
                : 'İşletmenizi yönetmek için aşağıdaki seçenekleri kullanabilirsiniz.'
              }
            </p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.user_type === 'customer' ? (
            // Müşteri Dashboard
            <>
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">Randevu Al</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  İşletmelerden randevu almak için buraya tıklayın.
                </p>
                <Link 
                  href="/appointments/new"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Randevu Al
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">Randevularım</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Mevcut randevularınızı görüntüleyin ve yönetin.
                </p>
                <Link 
                  href="/appointments"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                >
                  Randevularımı Görüntüle
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">İşletmeler</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Randevu alabileceğiniz işletmeleri keşfedin.
                </p>
                <Link 
                  href="/businesses"
                  className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
                >
                  İşletmeleri Görüntüle
                </Link>
              </div>


            </>
          ) : (
            // İşletme Dashboard
            <>
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">Bekleyen Talepler</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Onay bekleyen randevu taleplerini görüntüleyin.
                </p>
                <Link 
                  href="/business/pending-appointments"
                  className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
                >
                  Talepleri Görüntüle
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">Tarihli Randevular</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Takvim ve günlük görünümde randevuları görüntüleyin ve yönetin.
                </p>
                <Link 
                  href="/business/appointments"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Takvimi Aç
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">İşletme Bilgileri</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  İşletme bilgilerinizi düzenleyin.
                </p>
                <Link 
                  href="/business/settings"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                >
                  İşletme Ayarları
                </Link>
              </div>


            </>
          )}
        </div>

        {/* İşletme Ayarları ana ekrandan kaldırıldı - sadece buton ile ayrı sayfa */}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İstatistikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-600">Toplam Randevu</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-gray-600">Onaylanan</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-gray-600">Bekleyen</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">{stats.cancelled}</div>
                              <div className="text-gray-600">İptal Edilen</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// İşletme Ayarları Inline Bileşeni
function BusinessSettingsInline() {
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [workingHours, setWorkingHours] = useState([
    { day: 'Pazartesi', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Salı', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Çarşamba', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Perşembe', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Cuma', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Cumartesi', open: '09:00', close: '16:00', isOpen: true },
    { day: 'Pazar', open: '10:00', close: '16:00', isOpen: false },
  ]);

  useEffect(() => {
    fetchBusinessSettings();
  }, []);

  const fetchBusinessSettings = async () => {
    try {
      const response = await fetch('/api/business/settings', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings?.workingHours) {
          setWorkingHours(data.settings.workingHours);
        }
      }
    } catch (error) {
      console.error('Business settings fetch error:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleWorkingHoursChange = (index: number, field: 'day' | 'open' | 'close' | 'isOpen', value: any) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value } as any;
    setWorkingHours(updated);
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMessage('');
    try {
      const response = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workingHours }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSettingsMessage('Ayarlar başarıyla kaydedildi');
      } else {
        setSettingsMessage(data.message || 'Kaydetme sırasında hata oluştu');
      }
    } catch (error) {
      setSettingsMessage('Kaydetme sırasında hata oluştu');
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">İşletme Ayarları</h3>
          <p className="text-gray-600 mt-1">Çalışma saatlerinizi yönetin</p>
        </div>
      </div>

      {settingsLoading ? (
        <div className="text-gray-600">Yükleniyor...</div>
      ) : (
        <div className="space-y-4">
          {workingHours.map((day, index) => (
            <div key={day.day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-24">
                <span className="text-sm font-medium text-gray-700">{day.day}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => handleWorkingHoursChange(index, 'isOpen', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Açık</span>
              </div>
              {day.isOpen && (
                <>
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => handleWorkingHoursChange(index, 'open', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => handleWorkingHoursChange(index, 'close', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </>
              )}
            </div>
          ))}

          {settingsMessage && (
            <div className={`p-3 rounded-lg ${settingsMessage.includes('başarıyla') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {settingsMessage}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={saveSettings}
              disabled={settingsSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {settingsSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
