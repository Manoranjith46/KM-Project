import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Login.module.css'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/'}api/auth`

const getDashboardPathByRole = (role) => {
  if (role === 'owner' || role === 'admin') return '/admin/dashboard';
  return '/resident/dashboard';
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({
    mobileNumber: '',
    password: '',
  })
  const [touched, setTouched] = useState({
    mobileNumber: false,
    password: false,
  })

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(getDashboardPathByRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const validateMobileNumber = (value) => {
    if (!value.trim()) {
      return 'Mobile number is required';
    }
    if (!/^[6-9]\d{9}$/.test(value.trim())) {
      return 'Enter a valid 10-digit mobile number';
    }
    return '';
  };

  const validatePassword = (value) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, mobileNumber: value });
    setError('');
    if (touched.mobileNumber) {
      setFieldErrors({ ...fieldErrors, mobileNumber: validateMobileNumber(value) });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setError('');
    if (touched.password) {
      setFieldErrors({ ...fieldErrors, password: validatePassword(value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'mobileNumber') {
      setFieldErrors({ ...fieldErrors, mobileNumber: validateMobileNumber(formData.mobileNumber) });
    } else if (field === 'password') {
      setFieldErrors({ ...fieldErrors, password: validatePassword(formData.password) });
    }
  };

  const validateForm = () => {
    const mobileError = validateMobileNumber(formData.mobileNumber);
    const passwordError = validatePassword(formData.password);

    setFieldErrors({
      mobileNumber: mobileError,
      password: passwordError,
    });
    setTouched({ mobileNumber: true, password: true });

    return !mobileError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const userData = {
        id: data.user.id,
        name: data.user.name,
        mobileNumber: data.user.mobileNumber,
        email: data.user.email,
        role: data.user.role,
      };

      login(userData);
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1} />
        <div className={styles.shape2} />
        <div className={styles.shape3} />
        <div className={styles.shape4} />
        <div className={styles.shape5} />
        <div className={styles.shape6} />
        <div className={styles.shape7} />
        <div className={styles.shape8} />
      </div>

      {/* Desktop Version - Login Only */}
      <div className={`${styles.card} ${styles.desktopCard}`}>
        <div className={styles.glassCard}>
          {/* Logo */}
          <div className={styles.desktopLogoContainer}>
            <div className={styles.desktopLogo}>Logo</div>
          </div>

          {/* Login Heading */}
          <h2 className={styles.heading}>Login</h2>

          {/* Error Message */}
          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="desktop-phone" className={styles.label}>
                Mobile Number
              </label>
              <input
                id="desktop-phone"
                type="tel"
                placeholder="9876543210"
                value={formData.mobileNumber}
                onChange={handleMobileChange}
                onBlur={() => handleBlur('mobileNumber')}
                className={`${styles.input} ${touched.mobileNumber && fieldErrors.mobileNumber ? styles.inputError : ''}`}
                disabled={loading}
              />
              {touched.mobileNumber && fieldErrors.mobileNumber && (
                <span className={styles.fieldError}>{fieldErrors.mobileNumber}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="desktop-password" className={styles.label}>
                Password
              </label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="desktop-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  className={`${styles.input} ${touched.password && fieldErrors.password ? styles.inputError : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggleBtn}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <span className={styles.fieldError}>{fieldErrors.password}</span>
              )}
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
