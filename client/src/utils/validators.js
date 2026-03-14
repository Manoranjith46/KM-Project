/**
 * Reusable validation functions for forms
 */

export const validators = {
  required: (value, fieldName = 'This field') => {
    if (value === null || value === undefined) return `${fieldName} is required`;
    if (typeof value === 'string' && !value.trim()) return `${fieldName} is required`;
    if (Array.isArray(value) && value.length === 0) return `${fieldName} is required`;
    return '';
  },

  mobileNumber: (value) => {
    if (!value || !value.trim()) return 'Mobile number is required';
    if (!/^[6-9]\d{9}$/.test(value.trim())) return 'Enter a valid 10-digit mobile number';
    return '';
  },

  phone: (value, required = true) => {
    if (!value || !value.trim()) {
      return required ? 'Phone number is required' : '';
    }
    if (!/^[6-9]\d{9}$/.test(value.trim())) return 'Enter a valid 10-digit phone number';
    return '';
  },

  email: (value, required = true) => {
    if (!value || !value.trim()) {
      return required ? 'Email is required' : '';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address';
    return '';
  },

  password: (value, minLength = 6) => {
    if (!value) return 'Password is required';
    if (value.length < minLength) return `Password must be at least ${minLength} characters`;
    return '';
  },

  confirmPassword: (value, password) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return '';
  },

  name: (value, fieldName = 'Name') => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    if (value.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return `${fieldName} should only contain letters`;
    return '';
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (!value || value.length < min) return `${fieldName} must be at least ${min} characters`;
    return '';
  },

  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) return `${fieldName} must be at most ${max} characters`;
    return '';
  },

  positiveNumber: (value, fieldName = 'Amount') => {
    if (value === '' || value === null || value === undefined) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (num <= 0) return `${fieldName} must be greater than 0`;
    return '';
  },

  number: (value, fieldName = 'Value', { min, max, required = true } = {}) => {
    if (value === '' || value === null || value === undefined) {
      return required ? `${fieldName} is required` : '';
    }
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
    return '';
  },

  date: (value, fieldName = 'Date', { required = true, minDate, maxDate } = {}) => {
    if (!value) {
      return required ? `${fieldName} is required` : '';
    }
    const dateVal = new Date(value);
    if (isNaN(dateVal.getTime())) return `${fieldName} must be a valid date`;
    if (minDate && dateVal < new Date(minDate)) return `${fieldName} cannot be before ${minDate}`;
    if (maxDate && dateVal > new Date(maxDate)) return `${fieldName} cannot be after ${maxDate}`;
    return '';
  },

  select: (value, fieldName = 'Selection') => {
    if (!value || value === '') return `Please select a ${fieldName.toLowerCase()}`;
    return '';
  },

  textarea: (value, fieldName = 'Description', { minLength = 10, maxLength = 1000, required = true } = {}) => {
    if (!value || !value.trim()) {
      return required ? `${fieldName} is required` : '';
    }
    if (value.trim().length < minLength) return `${fieldName} must be at least ${minLength} characters`;
    if (value.trim().length > maxLength) return `${fieldName} must be at most ${maxLength} characters`;
    return '';
  },

  time: (value, fieldName = 'Time', required = true) => {
    if (!value || !value.trim()) {
      return required ? `${fieldName} is required` : '';
    }
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value.trim()) &&
        !/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/i.test(value.trim())) {
      return `${fieldName} must be a valid time format`;
    }
    return '';
  },

  upiId: (value, required = false) => {
    if (!value || !value.trim()) {
      return required ? 'UPI ID is required' : '';
    }
    if (!/^[\w.-]+@[\w.-]+$/.test(value.trim())) return 'Enter a valid UPI ID (e.g., name@upi)';
    return '';
  },
};

/**
 * Create a validation schema for a form
 * @param {Object} schema - Object with field names as keys and validator functions as values
 * @returns {Function} - Function that validates all fields and returns errors object
 */
export const createValidator = (schema) => {
  return (values) => {
    const errors = {};
    for (const [field, validate] of Object.entries(schema)) {
      const error = validate(values[field], values);
      if (error) errors[field] = error;
    }
    return errors;
  };
};
