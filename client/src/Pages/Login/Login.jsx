import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Login.module.css'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

// ... inside the component
const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
  navigate('/admin-dashboard');
    // e.preventDefault();
    // try {
    //     // 1. Call your backend login route
    //     const response = await API.post('/auth/login', {
    //         phone: formData.phone,
    //         password: formData.password
    //     });

    //     if(response.status !== 200) {
    //       alert("Login Failed");
    //     }

    //     // 2. Save user data and token in Context
    //     login(response.data); 

    //     // 3. Redirect based on the role the backend sent
    //     if (response.data.user.role === 'owner') {
    //         navigate('/admin-dashboard');
    //     } else {
    //         navigate('/resident-portal');
    //     }
    // } catch (error) {
    //     alert(error.response?.data?.message || "Login Failed");
    // }
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

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="desktop-phone" className={styles.label}>
                Phone Number
              </label>
              <input
                id="desktop-phone"
                type="tel"
                placeholder="+91    1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={styles.input}
                required
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggleBtn}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitButton}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
