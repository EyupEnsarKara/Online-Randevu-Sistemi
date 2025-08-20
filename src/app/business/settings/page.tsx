'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WorkingHours {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export default function BusinessSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Pazartesi', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Salı', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Çarşamba', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Perşembe', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Cuma', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Cumartesi', open: '09:00', close: '16:00', isOpen: true },
    { day: 'Pazar', open: '10:00', close: '16:00', isOpen: false }
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/business/settings', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.settings.workingHours) {
            setWorkingHours(data.settings.workingHours);
          }
        }
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHours, value: any) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setWorkingHours(updatedHours);
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          workingHours
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('Ayarlar başarıyla kaydedildi');
        } else {
          setMessage(data.message || 'Kaydetme sırasında hata oluştu');
        }
      } else {
        setMessage('Kaydetme sırasında hata oluştu');
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition duration-200">
                Randevu+
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Geri Dön
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">İşletme Ayarları</h1>
            <p className="text-gray-600 mt-2">Çalışma saatlerinizi yönetin</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('başarıyla') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Working Hours Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Çalışma Saatleri</h3>
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
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 