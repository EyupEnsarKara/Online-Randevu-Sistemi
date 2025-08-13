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

// Form validation fonksiyonu
export function validateForm(data: any, rules: ValidationRules): ValidationResult {
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // Required kontrolü
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} alanı zorunludur`);
      continue;
    }

    // Boş değer kontrolü (required değilse)
    if (!value || value.toString().trim() === '') {
      continue;
    }

    // Min length kontrolü
    if (rule.minLength && value.toString().length < rule.minLength) {
      errors.push(`${field} alanı en az ${rule.minLength} karakter olmalıdır`);
    }

    // Max length kontrolü
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      errors.push(`${field} alanı en fazla ${rule.maxLength} karakter olmalıdır`);
    }

    // Pattern kontrolü
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      errors.push(`${field} alanı geçerli formatta değil`);
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Önceden tanımlanmış validation kuralları
export const commonValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 100
  },
  phone: {
    required: true,
    pattern: /^[\d\s\-\+\(\)]+$/
  },
  date: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        return 'Geçmiş tarih seçilemez';
      }
      return null;
    }
  },
  time: {
    required: true,
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  }
};

// Randevu formu validation
export const appointmentValidationRules: ValidationRules = {
  business_id: { required: true },
  date: commonValidationRules.date,
  time: commonValidationRules.time,
  notes: { maxLength: 500 }
};

// Kullanıcı kayıt validation
export const userRegistrationRules: ValidationRules = {
  name: commonValidationRules.name,
  email: commonValidationRules.email,
  password: commonValidationRules.password
};

// İşletme kayıt validation
export const businessRegistrationRules: ValidationRules = {
  ...userRegistrationRules,
  businessName: { required: true, minLength: 2, maxLength: 100 },
  businessAddress: { required: true, minLength: 10, maxLength: 200 },
  businessPhone: commonValidationRules.phone
};
