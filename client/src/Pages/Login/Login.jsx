import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Login.module.css'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/'}api/auth`

const getDashboardPathByRole = (role) => {
  if (role === 'owner' || role === 'admin') return '/admin/dashboard';
  // resident, guest, or any other role → resident pages
  return '/resident/dashboard';
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if logged in (handles initial load and post-login state update)
  useEffect(() => {
    if (user) {
      navigate(getDashboardPathByRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Login successful
      const userData = {
        id: data.user.id,
        name: data.user.name,
        mobileNumber: data.user.mobileNumber,
        email: data.user.email,
        role: data.user.role,
      };

      // Set user in context - useEffect will handle navigation after state update
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
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '5px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
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
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className={styles.input}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="desktop-password" className={styles.label}>
                Password
              </label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="desktop-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles.input}
                  required
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
