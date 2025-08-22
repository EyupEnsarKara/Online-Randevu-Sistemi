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
  const [availableSlots, setAvailableSlots] = useState<Array<{time: string, available: boolean}>>([]);
  const [businessHours, setBusinessHours] = useState<{open: string, close: string} | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [businessWorkingDays, setBusinessWorkingDays] = useState<{[key: number]: boolean}>({});
  const [loadingWorkingDays, setLoadingWorkingDays] = useState(false);
  
  // Ay geçişi için state
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // İşletme seçildiğinde çalışma günlerini yükle
  useEffect(() => {
    if (selectedBusiness) {
      loadBusinessWorkingDays(selectedBusiness);
    }
  }, [selectedBusiness]);

  // Tarih veya işletme değiştiğinde müsait saatleri yükle
  useEffect(() => {
    if (selectedBusiness && formData.date) {
      loadAvailableSlots(selectedBusiness, formData.date);
    }
  }, [selectedBusiness, formData.date]);

  // İşletmenin çalışma günlerini yükle
  const loadBusinessWorkingDays = async (businessId: number) => {
    if (!businessId) return;
    
    setLoadingWorkingDays(true);
    try {
      const response = await fetch(`/api/business-hours?business_id=${businessId}`);
      const data = await response.json();
      
      if (data.success) {
        const workingDays: {[key: number]: boolean} = {};
        data.business_hours.forEach((hour: any) => {
          workingDays[hour.day_of_week] = hour.is_working_day === 1;
        });
        setBusinessWorkingDays(workingDays);
      } else {
        setBusinessWorkingDays({});
      }
    } catch (error) {
      console.error('Çalışma günleri yüklenirken hata:', error);
      setBusinessWorkingDays({});
    } finally {
      setLoadingWorkingDays(false);
    }
  };

  // Müsait saatleri yükle
  const loadAvailableSlots = async (businessId: number, date: string) => {
    if (!businessId || !date) return;
    
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/available-slots?business_id=${businessId}&date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.available_slots);
        setBusinessHours(data.business_hours);
      } else {
        setAvailableSlots([]);
        setBusinessHours(null);
      }
    } catch (error) {
      console.error('Müsait saatler yüklenirken hata:', error);
      setAvailableSlots([]);
      setBusinessHours(null);
    } finally {
      setLoadingSlots(false);
    }
  };

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

  // Ay değiştirme fonksiyonları
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Bugünden sonraki tarihleri al
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Takvim için yardımcı fonksiyonlar
  const getCurrentMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    const startDate = new Date(firstDay);
    
    // Ayın ilk gününden önceki boş günleri ekle
    while (startDate.getDay() > 0) {
      startDate.setDate(startDate.getDate() - 1);
    }
    
    // Ayın tüm günlerini ekle
    while (startDate <= lastDay) {
      dates.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    
    // Ayın son gününden sonraki boş günleri ekle
    while (startDate.getDay() < 6) {
      dates.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    
    return dates;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tarih karşılaştırmasını düzelt
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck < today) return false;
    
    const dayOfWeek = date.getDay();
    return businessWorkingDays[dayOfWeek] === true;
  };

  const formatDate = (date: Date) => {
    // Timezone sorununu önlemek için yerel tarih kullan
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayName = (date: Date) => {
    const dayNames = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return dayNames[date.getDay()];
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
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

            {/* Tarih Seçimi - Takvim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih Seçin *
              </label>
              
              {loadingWorkingDays ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Çalışma günleri yükleniyor...
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  {/* Takvim Başlığı ve Navigasyon */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        type="button"
                        onClick={goToCurrentMonth}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        Bugün
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Gün Başlıkları */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day, index) => {
                      const isWorkingDay = businessWorkingDays[index];
                      return (
                        <div key={day} className={`text-center text-sm font-medium py-2 ${
                          isWorkingDay ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {day}
                          <div className="text-xs mt-1">
                            {isWorkingDay ? '🟢' : '🔴'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Takvim Günleri */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCurrentMonthDates().map((date, index) => {
                      const dateStr = formatDate(date);
                      const isSelectable = isDateSelectable(date);
                      const isSelected = formData.date === dateStr;
                      const isCurrentMonthDate = isCurrentMonth(date);
                      const isTodayDate = isToday(date);
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (isSelectable) {
                              console.log('Seçilen tarih:', dateStr, 'Orijinal date objesi:', date);
                              setFormData({...formData, date: dateStr});
                            }
                          }}
                          disabled={!isSelectable}
                          className={`
                            p-2 text-sm rounded-lg transition-all duration-200 min-h-[40px] flex flex-col items-center justify-center relative
                            ${isSelected 
                              ? 'bg-blue-600 text-white font-medium border-2 border-blue-700' 
                              : isSelectable
                                ? 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 border border-gray-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            }
                            ${!isCurrentMonthDate ? 'opacity-50' : ''}
                            ${isTodayDate ? 'ring-2 ring-blue-300' : ''}
                          `}
                        >
                          <span className="text-xs font-medium">{getDayName(date)}</span>
                          <span className={`text-xs font-bold ${isTodayDate ? 'text-blue-600' : ''}`}>
                            {date.getDate()}
                          </span>
                          {isTodayDate && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          {isSelectable && (
                            <span className="text-xs mt-1">🟢</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Seçili Tarih Bilgisi */}
                  {formData.date && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600">
                        Seçili Tarih: {new Date(formData.date + 'T00:00:00').toLocaleDateString('tr-TR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  
                  {/* Açıklama */}
                  <div className="mt-3 text-center text-xs text-gray-500">
                    <p>🟢 Çalışma günü | 🔴 Kapalı gün | 🔵 Bugün</p>
                    <p className="mt-1">Sadece çalışma günlerinde randevu alabilirsiniz</p>
                    <p className="mt-1">Önceki ve sonraki aylara geçiş yapabilirsiniz</p>
                  </div>
                </div>
              )}
            </div>

            {/* Saat Seçimi */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Saat *
              </label>
              
              {loadingSlots ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Müsait saatler yükleniyor...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setFormData({...formData, time: slot.time})}
                      className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                        formData.time === slot.time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : slot.available
                            ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  {businessHours ? 'Bu tarihte müsait saat yok' : 'Önce tarih seçin'}
                </div>
              )}
              
              {businessHours && (
                <p className="mt-2 text-sm text-gray-600">
                  Çalışma saatleri: {businessHours.open} - {businessHours.close}
                  {businessHours.slot_duration && (
                    <span className="ml-2 text-blue-600">
                      (Randevu arası: {businessHours.slot_duration} dakika)
                    </span>
                  )}
                </p>
              )}
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