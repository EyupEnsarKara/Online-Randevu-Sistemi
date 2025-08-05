'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  notes: string;
  created_at: string;
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  customer_name?: string;
  customer_email?: string;
}

export default function AppointmentDetailPage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
      fetchUserType();
    }
  }, [appointmentId]);

  const fetchUserType = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserType(data.user.user_type);
      }
    } catch (error) {
      console.error('User type fetch error:', error);
    }
  };

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      const data = await response.json();

      if (data.success) {
        setAppointment(data.appointment);
      } else {
        setError(data.message || 'Randevu bulunamadı');
      }
    } catch (error) {
      setError('Randevu yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'approved':
        return 'Onaylandı';
      case 'denied':
        return 'Reddedildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR');
  };

  const updateAppointmentStatus = async (newStatus: string) => {
    if (!appointment) return;
    
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Randevuyu yeniden yükle
        await fetchAppointment();
      } else {
        setError(data.message || 'Durum güncellenirken hata oluştu');
      }
    } catch (error) {
      setError('Durum güncellenirken hata oluştu');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Randevu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Hata</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'Randevu bulunamadı'}</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/appointments')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Randevularıma Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/appointments')}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Randevularıma Dön
          </button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Randevu Detayları</h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Randevu #{appointment.id}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {appointment.business_name || appointment.customer_name}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tarih</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(appointment.date)}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Saat</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointment.time}
                </dd>
              </div>
              {appointment.business_name && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">İşletme</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.business_name}
                  </dd>
                </div>
              )}
              {appointment.business_address && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Adres</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.business_address}
                  </dd>
                </div>
              )}
              {appointment.business_phone && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a href={`tel:${appointment.business_phone}`} className="text-blue-600 hover:text-blue-500">
                      {appointment.business_phone}
                    </a>
                  </dd>
                </div>
              )}
              {appointment.customer_name && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Müşteri</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.customer_name}
                  </dd>
                </div>
              )}
              {appointment.customer_email && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a href={`mailto:${appointment.customer_email}`} className="text-blue-600 hover:text-blue-500">
                      {appointment.customer_email}
                    </a>
                  </dd>
                </div>
              )}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDateTime(appointment.created_at)}
                </dd>
              </div>
              {appointment.notes && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notlar</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-md p-3">
                      {appointment.notes}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* İşletme sahipleri için durum güncelleme butonları */}
        {userType === 'business' && appointment && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Randevu Durumunu Güncelle</h4>
            <div className="flex flex-wrap gap-2">
                             <button
                 onClick={() => updateAppointmentStatus('approved')}
                 disabled={updatingStatus || appointment.status === 'approved'}
                 className={`px-4 py-2 rounded-md text-sm font-medium ${
                   appointment.status === 'approved'
                     ? 'bg-green-100 text-green-800 cursor-not-allowed'
                     : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                 }`}
               >
                 {updatingStatus ? 'Güncelleniyor...' : 'Onayla'}
               </button>
              <button
                onClick={() => updateAppointmentStatus('denied')}
                disabled={updatingStatus || appointment.status === 'denied'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  appointment.status === 'denied'
                    ? 'bg-red-100 text-red-800 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                }`}
              >
                {updatingStatus ? 'Güncelleniyor...' : 'Reddet'}
              </button>
                             {/* İptal butonu sadece onaylanmış randevular için */}
               {appointment.status === 'approved' && (
                 <button
                   onClick={() => updateAppointmentStatus('cancelled')}
                   disabled={updatingStatus || appointment.status === 'cancelled'}
                   className={`px-4 py-2 rounded-md text-sm font-medium ${
                     appointment.status === 'cancelled'
                       ? 'bg-gray-100 text-gray-800 cursor-not-allowed'
                       : 'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                   }`}
                 >
                   {updatingStatus ? 'Güncelleniyor...' : 'İptal Et'}
                 </button>
               )}
            </div>
          </div>
        )}

        {/* Müşteriler için iptal butonu */}
        {userType === 'customer' && appointment && appointment.status === 'pending' && (
          <div className="mt-6 bg-red-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-red-900 mb-4">Randevu İptali</h4>
            <p className="text-red-700 text-sm mb-4">
              Bu randevuyu iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
                         <button
               onClick={() => updateAppointmentStatus('cancelled')}
               disabled={updatingStatus}
               className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {updatingStatus ? 'İptal ediliyor...' : 'Randevuyu İptal Et'}
             </button>
          </div>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/appointments')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Randevularıma Dön
          </button>
          <button
            onClick={() => router.push('/appointments/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Randevu
          </button>
        </div>
      </div>
    </div>
  );
} 