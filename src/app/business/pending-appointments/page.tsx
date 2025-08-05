'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PendingAppointment {
  id: number;
  date: string;
  time: string;
  notes: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
}

export default function PendingAppointmentsPage() {
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?status=pending', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAppointments(data.appointments);
        } else {
          setError(data.message || 'Randevular yüklenirken hata oluştu');
        }
      } else {
        setError('Randevular yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Başarı mesajı göster
          const statusText = status === 'approved' ? 'onaylandı' : 'reddedildi';
          alert(`Randevu başarıyla ${statusText}`);
          // Randevu listesini yenile
          fetchPendingAppointments();
        } else {
          alert(data.message || 'Durum güncellenirken hata oluştu');
        }
      } else {
        alert('Durum güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Bağlantı hatası oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bekleyen Randevu Talepleri</h1>
              <p className="text-gray-600 mt-2">Onay bekleyen randevu taleplerini yönetin</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen Randevu Yok</h3>
              <p className="text-gray-600">Şu anda onay bekleyen randevu talebi bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.customer_name}
                          </h3>
                          <p className="text-gray-600">{appointment.customer_email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Tarih:</span>
                          <p className="text-gray-900">{formatDate(appointment.date)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Saat:</span>
                          <p className="text-gray-900">{formatTime(appointment.time)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Talep Tarihi:</span>
                          <p className="text-gray-900">{formatDate(appointment.created_at)}</p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-500">Notlar:</span>
                          <p className="text-gray-900 mt-1">{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'denied')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 text-sm font-medium"
                      >
                        Reddet
                      </button>
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium text-center"
                      >
                        Detayları Görüntüle
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 