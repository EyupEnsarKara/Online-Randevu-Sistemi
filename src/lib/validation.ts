// Basit form validation utility'si

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

// Form validation utilities
export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('Bu alan zorunludur');
  }

  if (value && rules.minLength && value.toString().length < rules.minLength) {
    errors.push(`En az ${rules.minLength} karakter olmalıdır`);
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength) {
    errors.push(`En fazla ${rules.maxLength} karakter olmalıdır`);
  }

  if (value && rules.pattern && !rules.pattern.test(value.toString())) {
    errors.push('Geçersiz format');
  }

  if (value && rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateForm = (data: Record<string, any>, schema: Record<string, ValidationRule>): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  for (const [field, rules] of Object.entries(schema)) {
    results[field] = validateField(data[field], rules);
  }

  return results;
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Geçerli bir email adresi giriniz' : null
  },
  password: { 
    required: true, 
    minLength: 6,
    custom: (value: string) => {
      if (!value) return null;
      if (value.length < 6) return 'Şifre en az 6 karakter olmalıdır';
      if (!/(?=.*[a-z])/.test(value)) return 'Şifre en az bir küçük harf içermelidir';
      if (!/(?=.*[A-Z])/.test(value)) return 'Şifre en az bir büyük harf içermelidir';
      if (!/(?=.*\d)/.test(value)) return 'Şifre en az bir rakam içermelidir';
      return null;
    }
  },
  phone: {
    pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/,
    custom: (value: string) => value && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value) ? 'Geçerli bir telefon numarası giriniz' : null
  }
};

// Randevu formu validation
export const appointmentValidationRules: ValidationRules = {
  business_id: { required: true },
  date: commonRules.date,
  time: commonRules.time,
  notes: { maxLength: 500 }
};

// Kullanıcı kayıt validation
export const userRegistrationRules: ValidationRules = {
  name: commonRules.name,
  email: commonRules.email,
  password: commonRules.password
};

// İşletme kayıt validation
export const businessRegistrationRules: ValidationRules = {
  ...userRegistrationRules,
  businessName: { required: true, minLength: 2, maxLength: 100 },
  businessAddress: { required: true, minLength: 10, maxLength: 200 },
  businessPhone: commonRules.phone
};
