'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Business {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<number | ''>('');
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  // URL'den işletme ID'sini al
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('business');
    if (businessId) {
      setSelectedBusiness(Number(businessId));
    }
  }, []);

  // İşletmeleri yükle
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const response = await fetch('/api/businesses');
        const data = await response.json();
        
        if (data.success) {
          setBusinesses(data.businesses);
        } else {
          console.error('İşletmeler yüklenemedi:', data.message);
        }
      } catch (error) {
        console.error('İşletmeler yüklenirken hata:', error);
      }
    };

    loadBusinesses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!selectedBusiness) {
      setMessage('Lütfen bir işletme seçin');
      setLoading(false);
      return;
    }

    if (!formData.date || !formData.time) {
      setMessage('Lütfen tarih ve saat seçin');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: selectedBusiness,
          date: formData.date,
          time: formData.time,
          notes: formData.notes
        })
      });
      const data = await response.json();

      if (data.success) {
        setMessage('Randevu başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/appointments');
        }, 2000);
      } else {
        setMessage(data.message || 'Randevu oluşturulurken bir hata oluştu');
      }

    } catch (error) {
      setMessage('Randevu oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Bugünden sonraki tarihleri al
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <h1 className="text-2xl font-bold text-gray-900">Yeni Randevu</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Randevu Al
            </h2>
            <p className="text-gray-600">
              İstediğiniz işletmeden randevu almak için aşağıdaki formu doldurun
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* İşletme Seçimi */}
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2">
                İşletme Seçin *
              </label>
              <select
                id="business"
                name="business"
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(Number(e.target.value) || '')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                required
              >
                <option value="">İşletme seçin</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} - {business.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Seçili İşletme Bilgileri */}
            {selectedBusiness && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  {businesses.find(b => b.id === selectedBusiness)?.name}
                </h3>
                <p className="text-blue-700 text-sm">
                  {businesses.find(b => b.id === selectedBusiness)?.description}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  📍 {businesses.find(b => b.id === selectedBusiness)?.address}
                </p>
                <p className="text-blue-600 text-sm">
                  📞 {businesses.find(b => b.id === selectedBusiness)?.phone}
                </p>
              </div>
            )}

            {/* Tarih Seçimi */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Tarih *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                required
              />
            </div>

            {/* Saat Seçimi */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Saat *
              </label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                required
              >
                <option value="">Saat seçin</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
              </select>
            </div>

            {/* Notlar */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notlar (İsteğe bağlı)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none resize-none"
                placeholder="Randevu ile ilgili özel isteklerinizi buraya yazabilirsiniz..."
              />
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
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Randevu oluşturuluyor...' : 'Randevu Oluştur'}
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
      </main>
    </div>
  );
} 