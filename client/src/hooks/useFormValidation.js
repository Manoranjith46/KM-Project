import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for form validation with field-level errors and focus on error click
 *
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Object with field names as keys and validator functions as values
 * @returns {Object} - Form state and handlers
 */
export const useFormValidation = (initialValues, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const inputRefs = useRef({});

  // Register a ref for an input field
  const registerRef = useCallback((fieldName) => (el) => {
    if (el) inputRefs.current[fieldName] = el;
  }, []);

  // Validate a single field
  const validateField = useCallback((fieldName, value) => {
    const validator = validationSchema[fieldName];
    if (validator) {
      return validator(value, values);
    }
    return '';
  }, [validationSchema, values]);

  // Handle input change
  const handleChange = useCallback((fieldName) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Clear error when user starts typing (if field was touched)
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [touched, validateField]);

  // Handle input change with custom transformer (e.g., for phone numbers)
  const handleChangeWithTransform = useCallback((fieldName, transform) => (e) => {
    const value = transform ? transform(e.target.value) : e.target.value;
    setValues(prev => ({ ...prev, [fieldName]: value }));

    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [touched, validateField]);

  // Handle blur - validate field on blur
  const handleBlur = useCallback((fieldName) => () => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [validateField, values]);

  // Focus on field when error is clicked
  const focusField = useCallback((fieldName) => () => {
    const el = inputRefs.current[fieldName];
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    const newTouched = {};

    for (const fieldName of Object.keys(validationSchema)) {
      newTouched[fieldName] = true;
      const error = validateField(fieldName, values[fieldName]);
      if (error) newErrors[fieldName] = error;
    }

    setTouched(newTouched);
    setErrors(newErrors);

    // Focus first error field
    const firstErrorField = Object.keys(newErrors)[0];
    if (firstErrorField && inputRefs.current[firstErrorField]) {
      inputRefs.current[firstErrorField].focus();
      inputRefs.current[firstErrorField].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(newErrors).length === 0;
  }, [validateField, validationSchema, values]);

  // Set a specific field value
  const setValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  // Set multiple values
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Reset form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Set a specific error
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  // Clear a specific error
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({ ...prev, [fieldName]: '' }));
  }, []);

  // Get input props for a field
  const getFieldProps = useCallback((fieldName, options = {}) => {
    const { transform } = options;
    return {
      ref: registerRef(fieldName),
      value: values[fieldName] ?? '',
      onChange: transform
        ? handleChangeWithTransform(fieldName, transform)
        : handleChange(fieldName),
      onBlur: handleBlur(fieldName),
    };
  }, [registerRef, values, handleChange, handleChangeWithTransform, handleBlur]);

  // Check if field has error (touched and has error)
  const hasError = useCallback((fieldName) => {
    return touched[fieldName] && errors[fieldName];
  }, [touched, errors]);

  // Get error message for a field
  const getError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  }, [touched, errors]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleChangeWithTransform,
    handleBlur,
    validateAll,
    validateField,
    setValue,
    setMultipleValues,
    resetForm,
    setFieldError,
    clearFieldError,
    registerRef,
    focusField,
    getFieldProps,
    hasError,
    getError,
    inputRefs,
  };
};

export default useFormValidation;
