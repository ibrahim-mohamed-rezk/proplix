/**
 * Phone number validation utilities
 * Supports Egyptian phone number formats only
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates Egyptian phone number format and returns validation result
 * @param phone - The phone number to validate
 * @param required - Whether the field is required
 * @returns PhoneValidationResult object with validation status
 */
export const validatePhoneNumber = (
  phone: string,
  required: boolean = true
): PhoneValidationResult => {
  // Remove all non-digit characters except + at the beginning
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if empty and required
  if (!phone.trim() && required) {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }
  
  // Check if empty and not required
  if (!phone.trim() && !required) {
    return {
      isValid: true,
      formatted: ''
    };
  }
  
  // Egyptian phone number validation
  const digitsOnly = cleanPhone.replace(/^\+/, '');
  
  // Egyptian mobile numbers: 01XXXXXXXX (11 digits total)
  // Egyptian landline: 0X XXXX XXXX (10 digits total)
  const egyptianMobilePattern = /^01[0-9]{9}$/; // 01 followed by 9 digits
  const egyptianLandlinePattern = /^0[2-8][0-9]{8}$/; // 0X followed by 8 digits (X = 2-8)
  const egyptianWithCountryCode = /^20(1[0-9]{9}|[2-8][0-9]{8})$/; // +20 followed by Egyptian number
  
  // Check if it's a valid Egyptian number
  const isValidEgyptianNumber = 
    egyptianMobilePattern.test(digitsOnly) ||
    egyptianLandlinePattern.test(digitsOnly) ||
    egyptianWithCountryCode.test(digitsOnly);
  
  if (!isValidEgyptianNumber) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number (e.g., 01234567890 or +201234567890)'
    };
  }
  
  // Format the phone number for display
  const formatted = formatEgyptianPhoneNumber(cleanPhone);
  
  return {
    isValid: true,
    formatted
  };
};

/**
 * Formats an Egyptian phone number for display
 * @param phone - The phone number to format
 * @returns Formatted phone number string
 */
export const formatEgyptianPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/[^\d]/g, '');
  
  // Egyptian mobile format: 01X XXX XXXX
  if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
  }
  
  // Egyptian landline format: 0X XXXX XXXX
  if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
    return `${digitsOnly.slice(0, 2)} ${digitsOnly.slice(2, 6)} ${digitsOnly.slice(6)}`;
  }
  
  // Egyptian with country code: +20 1X XXX XXXX or +20 X XXXX XXXX
  if (digitsOnly.length === 12 && digitsOnly.startsWith('20')) {
    const number = digitsOnly.slice(2);
    if (number.startsWith('1')) {
      return `+20 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
    } else {
      return `+20 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5)}`;
    }
  }
  
  return phone;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use formatEgyptianPhoneNumber instead
 */
export const formatPhoneNumber = formatEgyptianPhoneNumber;

/**
 * Yup validation schema for Egyptian phone numbers
 */
export const phoneValidationSchema = {
  required: (message: string = 'Phone number is required') => ({
    required: true,
    message
  }),
  
  format: (message: string = 'Please enter a valid phone number') => ({
    pattern: /^(01[0-9]{9}|0[2-8][0-9]{8}|\+20(1[0-9]{9}|[2-8][0-9]{8}))$/,
    message
  }),
  
  minLength: (min: number = 10, message: string = 'Phone number must be at least 10 digits') => ({
    min: min,
    message
  }),
  
  maxLength: (max: number = 12, message: string = 'Phone number cannot exceed 12 digits') => ({
    max: max,
    message
  })
};

/**
 * Egyptian phone number patterns
 */
export const PHONE_PATTERNS = {
  EGYPTIAN_MOBILE: /^01[0-9]{9}$/, // 01XXXXXXXX (11 digits)
  EGYPTIAN_LANDLINE: /^0[2-8][0-9]{8}$/, // 0X XXXX XXXX (10 digits)
  EGYPTIAN_WITH_COUNTRY_CODE: /^20(1[0-9]{9}|[2-8][0-9]{8})$/, // +20 followed by Egyptian number
  EGYPTIAN_GENERAL: /^(01[0-9]{9}|0[2-8][0-9]{8}|\+20(1[0-9]{9}|[2-8][0-9]{8}))$/
};

/**
 * Egyptian phone validation (only supported country)
 */
export const validatePhoneByCountry = (phone: string, countryCode: string): PhoneValidationResult => {
  // Only support Egypt (EG) - redirect all to Egyptian validation
  return validatePhoneNumber(phone);
};

/**
 * Validates Egyptian mobile numbers (01XXXXXXXX)
 */
export const validateEgyptianMobile = (phone: string): PhoneValidationResult => {
  const digitsOnly = phone.replace(/[^\d]/g, '');
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
    return { 
      isValid: true, 
      formatted: formatEgyptianPhoneNumber(phone) 
    };
  }
  
  return {
    isValid: false,
    error: 'Please enter a valid Egyptian mobile number (01XXXXXXXX)'
  };
};

/**
 * Validates Egyptian landline numbers (0X XXXX XXXX)
 */
export const validateEgyptianLandline = (phone: string): PhoneValidationResult => {
  const digitsOnly = phone.replace(/[^\d]/g, '');
  
  if (digitsOnly.length === 10 && digitsOnly.startsWith('0') && 
      parseInt(digitsOnly[1]) >= 2 && parseInt(digitsOnly[1]) <= 8) {
    return { 
      isValid: true, 
      formatted: formatEgyptianPhoneNumber(phone) 
    };
  }
  
  return {
    isValid: false,
    error: 'Please enter a valid Egyptian landline number (0X XXXX XXXX)'
  };
};
