'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type BusinessAppointment = {
	id: number;
	date: string; // YYYY-MM-DD
	time: string; // HH:mm
	status: 'pending' | 'approved' | 'denied' | 'cancelled' | string;
	notes?: string;
	created_at: string;
	customer_name?: string;
	customer_email?: string;
	slot_duration?: number; // Added for slot duration
};

const turkishMonths = [
	'Ocak',
	'Şubat',
	'Mart',
	'Nisan',
	'Mayıs',
	'Haziran',
	'Temmuz',
	'Ağustos',
	'Eylül',
	'Ekim',
	'Kasım',
	'Aralık',
];

function startOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatYMD(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function classNames(...classes: (string | boolean | undefined)[]) {
	return classes.filter(Boolean).join(' ');
}

function getStatusBadgeClasses(status: string) {
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
}

export default function BusinessAppointmentsCalendarPage() {
	const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
	const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
	const [dayAppointments, setDayAppointments] = useState<BusinessAppointment[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [monthDatesWithAppointments, setMonthDatesWithAppointments] = useState<Set<string>>(new Set());
	const [monthMapLoading, setMonthMapLoading] = useState<boolean>(false);

	// Takvim ızgarası: önceki/sonraki ayın doldurma günleri dahil 6 satır x 7 sütun
	const calendarDays = useMemo(() => {
		const start = startOfMonth(currentMonth);
		const end = endOfMonth(currentMonth);
		const startWeekday = (start.getDay() + 6) % 7; // Pazartesi=0, Pazar=6
		const daysInMonth = end.getDate();

		const days: { date: Date; inCurrentMonth: boolean }[] = [];

		// Önceki aydan doldurma
		for (let i = 0; i < startWeekday; i++) {
			const d = new Date(start);
			d.setDate(start.getDate() - (startWeekday - i));
			days.push({ date: d, inCurrentMonth: false });
		}

		// Bu ay
		for (let i = 1; i <= daysInMonth; i++) {
			const d = new Date(start.getFullYear(), start.getMonth(), i);
			days.push({ date: d, inCurrentMonth: true });
		}

		// Sonraki aydan doldurma (42 hücre tamamla)
		while (days.length < 42) {
			const last = days[days.length - 1].date;
			const d = new Date(last);
			d.setDate(last.getDate() + 1);
			days.push({ date: d, inCurrentMonth: d.getMonth() === currentMonth.getMonth() });
		}

		return days;
	}, [currentMonth]);

	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			setLoading(true);
			setError('');
			try {
				const ymd = formatYMD(selectedDate);
				const res = await fetch(`/api/appointments?date=${encodeURIComponent(ymd)}` , { signal: controller.signal });
				if (!res.ok) {
					throw new Error('Randevular yüklenemedi');
				}
				const data = await res.json();
				if (!data.success) {
					throw new Error(data.message || 'Randevular yüklenemedi');
				}
				const items: BusinessAppointment[] = Array.isArray(data.appointments) ? data.appointments : [];
				// Saat artan sıraya göre sırala (HH:mm)
				items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
				setDayAppointments(items);
			} catch (e: any) {
				if (e?.name !== 'AbortError') {
					setError(e?.message || 'Bir hata oluştu');
				}
			} finally {
				setLoading(false);
			}
		})();
		return () => controller.abort();
	}, [selectedDate]);

	// Ay görünümü değiştiğinde o aya ait randevu olan günleri getir
	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			setMonthMapLoading(true);
			try {
				const year = currentMonth.getFullYear();
				const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
				const res = await fetch(`/api/appointments?limit=1000&offset=0`, { signal: controller.signal });
				if (!res.ok) return;
				const data = await res.json();
				if (!data?.success || !Array.isArray(data.appointments)) return;
				const prefix = `${year}-${month}-`;
				const setDates = new Set<string>();
				for (const a of data.appointments as BusinessAppointment[]) {
					if (typeof a.date === 'string' && a.date.startsWith(prefix)) {
						setDates.add(a.date);
					}
				}
				setMonthDatesWithAppointments(setDates);
			} catch (_) {
				// sessiz geç
			} finally {
				setMonthMapLoading(false);
			}
		})();
		return () => controller.abort();
	}, [currentMonth]);

	const goPrevMonth = () => {
		const d = new Date(currentMonth);
		d.setMonth(currentMonth.getMonth() - 1);
		setCurrentMonth(d);
	};

	const goNextMonth = () => {
		const d = new Date(currentMonth);
		d.setMonth(currentMonth.getMonth() + 1);
		setCurrentMonth(d);
	};

	const today = new Date();
	const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
	const isToday = (d: Date) => isSameDay(d, today);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
							Randevu+
						</Link>
						<div className="flex items-center gap-2">
							<Link href="/business/pending-appointments" className="px-3 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700">
								Bekleyen Talepler
							</Link>
							<Link href="/appointments" className="px-3 py-2 text-sm rounded-lg bg-gray-600 text-white hover:bg-gray-700">
								Tüm Randevular
							</Link>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Takvim */}
					<div className="bg-white rounded-2xl shadow-xl p-6">
						<div className="flex items-center justify-between mb-4">
							<button onClick={goPrevMonth} className="p-2 rounded-lg hover:bg-gray-100">
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
							</button>
							<h2 className="text-lg font-semibold text-gray-900">
								{turkishMonths[currentMonth.getMonth()]} {currentMonth.getFullYear()}
							</h2>
							<button onClick={goNextMonth} className="p-2 rounded-lg hover:bg-gray-100">
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
							</button>
						</div>

						<div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
							<div className="py-2 text-center">Pzt</div>
							<div className="py-2 text-center">Sal</div>
							<div className="py-2 text-center">Çar</div>
							<div className="py-2 text-center">Per</div>
							<div className="py-2 text-center">Cum</div>
							<div className="py-2 text-center">Cmt</div>
							<div className="py-2 text-center">Paz</div>
						</div>

						<div className="grid grid-cols-7 gap-1">
							{calendarDays.map(({ date, inCurrentMonth }) => {
								const selected = isSameDay(date, selectedDate);
								return (
									<button
										key={`${date.toISOString()}-${inCurrentMonth ? 'in' : 'out'}`}
										onClick={() => {
											setSelectedDate(date);
											// Ay görünümünü seçilen güne göre hizala
											if (date.getMonth() !== currentMonth.getMonth()) {
												setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
											}
										}}
										className={classNames(
											'rounded-lg p-2 text-sm text-center transition',
											inCurrentMonth ? 'text-gray-900' : 'text-gray-400',
											selected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100',
											isToday(date) && !selected && 'ring-1 ring-blue-400'
										)}
									>
										<div>{date.getDate()}</div>
										{inCurrentMonth && monthDatesWithAppointments.has(formatYMD(date)) && (
											<span className={classNames('mx-auto mt-1 block h-1 w-1 rounded-full', selected ? 'bg-white' : 'bg-blue-500')}></span>
										)}
									</button>
								);
							})}
						</div>

						<div className="mt-4 flex items-center justify-between">
							<button
								onClick={() => setSelectedDate(new Date())}
								className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
							>
								Bugün
							</button>
							<div className="text-sm text-gray-500">Seçili gün: {formatYMD(selectedDate)}</div>
						</div>
					</div>

					{/* Günlük Liste */}
					<div className="bg-white rounded-2xl shadow-xl p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-gray-900">Günlük Randevular</h2>
							<div className="text-sm text-gray-500">
								{new Date(selectedDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
								{dayAppointments.length > 0 && (
									<span className="ml-2 text-blue-600">
										(Slot: {dayAppointments[0]?.slot_duration || 30}dk)
									</span>
								)}
							</div>
						</div>

						{loading ? (
							<div className="flex items-center justify-center py-10 text-gray-500">
								<svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24"> 
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
								</svg>
								Yükleniyor...
							</div>
						) : error ? (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
						) : dayAppointments.length === 0 ? (
							<div className="text-center py-12 text-gray-600">
								<svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
								Bu gün için randevu bulunmuyor.
							</div>
						) : (
							<ul className="divide-y divide-gray-200">
								{dayAppointments.map((a) => (
									<li key={a.id} className="py-4 flex items-start justify-between">
										<div className="flex items-start gap-4 flex-1 min-w-0">
											<div className="flex-shrink-0 bg-blue-50 text-blue-700 rounded-md px-2 py-1 text-sm font-medium">{a.time}</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<p className="text-sm font-semibold text-gray-900 truncate">
														{a.customer_name || 'Müşteri'}
													</p>
													<span className={classNames('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadgeClasses(a.status))}>
														{a.status === 'pending' && 'Beklemede'}
														{a.status === 'approved' && 'Onaylandı'}
														{a.status === 'denied' && 'Reddedildi'}
														{a.status === 'cancelled' && 'İptal Edildi'}
														{!['pending','approved','denied','cancelled'].includes(a.status) && a.status}
													</span>
												</div>
												{a.customer_email && (
													<p className="text-xs text-gray-500 break-all">{a.customer_email}</p>
												)}
												{a.notes && (
													<p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">{a.notes}</p>
												)}
											</div>
										</div>
										<div className="flex-shrink-0">
											<Link href={`/appointments/${a.id}`} className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">Detay</Link>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}


