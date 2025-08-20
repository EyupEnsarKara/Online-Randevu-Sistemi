'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'customer' | 'business';
}

interface BusinessProfile {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // İşletme bilgileri (yalnızca business kullanıcıları için)
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessMessage, setBusinessMessage] = useState('');
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData(prev => ({
          ...prev,
          name: data.user.name,
          email: data.user.email
        }));

        // İşletme kullanıcısı ise işletme bilgilerini çek
        if (data.user.user_type === 'business') {
          setBusinessLoading(true);
          try {
            const bizRes = await fetch('/api/business/profile', { credentials: 'include' });
            if (bizRes.ok) {
              const bizData = await bizRes.json();
              if (bizData.success && bizData.business) {
                setBusiness(bizData.business);
                setBusinessForm({
                  name: bizData.business.name || '',
                  description: bizData.business.description || '',
                  address: bizData.business.address || '',
                  phone: bizData.business.phone || ''
                });
              }
            }
          } catch (e) {
            console.error('Business profile fetch error:', e);
          } finally {
            setBusinessLoading(false);
          }
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // Şifre değişikliği kontrolü
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setMessage('Mevcut şifrenizi girmeniz gerekiyor');
        setSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage('Yeni şifreler eşleşmiyor');
        setSaving(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setMessage('Yeni şifre en az 6 karakter olmalıdır');
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Profil başarıyla güncellendi');
        // Şifre alanlarını temizle
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        // Kullanıcı bilgilerini güncelle
        if (user) {
          setUser({
            ...user,
            name: formData.name,
            email: formData.email
          });
        }
      } else {
        setMessage(data.message || 'Profil güncellenirken hata oluştu');
      }
    } catch (error) {
      setMessage('Profil güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessMessage('');
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(businessForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBusinessMessage('İşletme bilgileri başarıyla güncellendi');
      } else {
        setBusinessMessage(data.message || 'Güncelleme sırasında hata oluştu');
      }
    } catch (err) {
      setBusinessMessage('Güncelleme sırasında hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {user.name}
            </h2>
            <p className="text-gray-600">
              {user.user_type === 'customer' ? 'Müşteri' : 'İşletme Sahibi'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ad */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                required
              />
            </div>

            {/* Şifre Değişikliği Bölümü */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Şifre Değiştir</h3>
              <p className="text-sm text-gray-600 mb-4">
                Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.
              </p>

              {/* Mevcut Şifre */}
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                />
              </div>

              {/* Yeni Şifre */}
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                />
              </div>

              {/* Şifre Tekrar */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                />
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg text-sm ${
                message.includes('başarıyla') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Güncelleniyor...' : 'Profili Güncelle'}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-700 font-medium transition duration-200"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
          </div>

          {/* İşletme Bilgileri (Business kullanıcıları için) */}
          {user.user_type === 'business' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">İşletme Bilgileri</h3>
              <p className="text-gray-600 mt-1">İşletme bilgilerinizi güncelleyin</p>
            </div>

            {businessLoading ? (
              <div className="text-gray-600">Yükleniyor...</div>
            ) : (
              <form onSubmit={handleBusinessSubmit} className="space-y-6">
                <div>
                  <label htmlFor="biz_name" className="block text-sm font-medium text-gray-700 mb-2">İşletme Adı *</label>
                  <input
                    id="biz_name"
                    name="name"
                    type="text"
                    value={businessForm.name}
                    onChange={handleBusinessChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="İşletme adınızı girin"
                  />
                </div>

                <div>
                  <label htmlFor="biz_description" className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <textarea
                    id="biz_description"
                    name="description"
                    rows={4}
                    value={businessForm.description}
                    onChange={handleBusinessChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="İşletmeniz hakkında kısa bir açıklama yazın"
                  />
                </div>

                <div>
                  <label htmlFor="biz_address" className="block text-sm font-medium text-gray-700 mb-2">Adres *</label>
                  <input
                    id="biz_address"
                    name="address"
                    type="text"
                    value={businessForm.address}
                    onChange={handleBusinessChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="İşletme adresinizi girin"
                  />
                </div>

                <div>
                  <label htmlFor="biz_phone" className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                  <input
                    id="biz_phone"
                    name="phone"
                    type="tel"
                    value={businessForm.phone}
                    onChange={handleBusinessChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Telefon numaranızı girin"
                  />
                </div>

                {businessMessage && (
                  <div className={`p-3 rounded-lg ${businessMessage.includes('başarıyla') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {businessMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
} 