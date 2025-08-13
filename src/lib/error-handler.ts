import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from './api-response';

// Error handling utility'si
export class ErrorHandler {
  // Genel error handler
  static handle(error: any, request: NextRequest) {
    console.error('API Error:', {
      url: request.url,
      method: request.method,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // SQLite constraint hatası
    if (error.code === 'SQLITE_CONSTRAINT') {
      return ApiResponse.conflict('Veri bütünlüğü hatası');
    }

    // SQLite unique constraint hatası
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return ApiResponse.conflict('Bu kayıt zaten mevcut');
    }

    // Validation hatası
    if (error.name === 'ValidationError') {
      return ApiResponse.validationError(error.errors || [error.message]);
    }

    // JWT hatası
    if (error.name === 'JWTError') {
      return ApiResponse.unauthorized('Geçersiz token');
    }

    // Genel server hatası
    return ApiResponse.serverError('Beklenmeyen bir hata oluştu');
  }

  // Async function wrapper
  static async wrap<T>(
    fn: () => Promise<T>,
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      const result = await fn();
      return ApiResponse.success(result);
    } catch (error: any) {
      return this.handle(error, request);
    }
  }

  // Database operation wrapper
  static async dbOperation<T>(
    operation: () => Promise<T>,
    request: NextRequest,
    errorMessage: string = 'Veritabanı işlemi başarısız'
  ): Promise<NextResponse> {
    try {
      const result = await operation();
      return ApiResponse.success(result);
    } catch (error: any) {
      console.error('Database Error:', error);
      return ApiResponse.serverError(errorMessage);
    }
  }
}

// Validation error class
export class ValidationError extends Error {
  public errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Business logic error class
export class BusinessError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'BusinessError';
    this.statusCode = statusCode;
  }
}

// Database error class
export class DatabaseError extends Error {
  public code: string;

  constructor(message: string, code: string = 'UNKNOWN') {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}
