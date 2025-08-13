import { NextResponse } from 'next/server';

// API Response wrapper'ları
export class ApiResponse {
  // Başarılı response
  static success<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json({
      success: true,
      message: message || 'İşlem başarılı',
      data
    }, { status });
  }

  // Hata response
  static error(message: string, status: number = 400, errors?: any[]) {
    return NextResponse.json({
      success: false,
      message,
      errors: errors || []
    }, { status });
  }

  // Validation hatası
  static validationError(errors: string[]) {
    return this.error('Validation hatası', 400, errors);
  }

  // Unauthorized
  static unauthorized(message: string = 'Yetkisiz erişim') {
    return this.error(message, 401);
  }

  // Forbidden
  static forbidden(message: string = 'Bu işlemi gerçekleştirme yetkiniz yok') {
    return this.error(message, 403);
  }

  // Not found
  static notFound(message: string = 'Kayıt bulunamadı') {
    return this.error(message, 404);
  }

  // Conflict
  static conflict(message: string = 'Çakışma oluştu') {
    return this.error(message, 409);
  }

  // Server error
  static serverError(message: string = 'Sunucu hatası') {
    return this.error(message, 500);
  }

  // Pagination response
  static paginated<T>(
    data: T[], 
    total: number, 
    limit: number, 
    offset: number,
    message?: string
  ) {
    return this.success({
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1
      }
    }, message);
  }
}

// HTTP Status kodları
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Response message'ları
export const ResponseMessages = {
  // Genel
  SUCCESS: 'İşlem başarılı',
  ERROR: 'Bir hata oluştu',
  
  // Auth
  LOGIN_SUCCESS: 'Giriş başarılı',
  LOGIN_FAILED: 'Giriş başarısız',
  REGISTER_SUCCESS: 'Kayıt başarılı',
  LOGOUT_SUCCESS: 'Çıkış başarılı',
  
  // Randevu
  APPOINTMENT_CREATED: 'Randevu başarıyla oluşturuldu',
  APPOINTMENT_UPDATED: 'Randevu başarıyla güncellendi',
  APPOINTMENT_DELETED: 'Randevu başarıyla silindi',
  APPOINTMENT_NOT_FOUND: 'Randevu bulunamadı',
  
  // İşletme
  BUSINESS_UPDATED: 'İşletme bilgileri güncellendi',
  BUSINESS_NOT_FOUND: 'İşletme bulunamadı',
  
  // Kullanıcı
  USER_UPDATED: 'Kullanıcı bilgileri güncellendi',
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  
  // Validation
  VALIDATION_ERROR: 'Form verilerinde hata var',
  REQUIRED_FIELD: 'Bu alan zorunludur',
  INVALID_EMAIL: 'Geçerli bir email adresi girin',
  INVALID_PHONE: 'Geçerli bir telefon numarası girin',
  PASSWORD_TOO_SHORT: 'Şifre en az 6 karakter olmalıdır'
} as const;
