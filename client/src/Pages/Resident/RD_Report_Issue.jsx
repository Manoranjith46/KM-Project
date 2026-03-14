import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./RD_Report_Issue.module.css";
import API from '../../API/axios';
import { minDelay } from '../../utils/minDelay';
import { useAuth } from '../../Context/AuthContext';
import useSocket from '../../hooks/useSocket';
import Loader from './Components/Loader/Loader';
import Popup from './Components/popup/Popup';
import { ReportSkeleton } from './Components/Skeleton/Skeleton';
import useBlockInteraction from '../../hooks/useBlockInteraction';
import { validators } from '../../utils/validators';
import { FormFieldError } from '../../Components/FormError';

export default function Resident_ReportIssue() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isGuest = user?.role === 'guest';
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  // Category to Icon mapping
  const categoryIcons = {
    electrical: "⚡",
    plumbing: "🚰",
    cleaning: "🧹",
    wifi: "📶",
    furniture: "🪑",
    other: "❓"
  };

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    photo: null,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const inputRefs = useRef({});

  const validateField = (field, value) => {
    if (field === 'category') return validators.select(value, 'Category');
    if (field === 'description') return validators.textarea(value, 'Description', { minLength: 10, maxLength: 500 });
    return '';
  };

  const focusField = (fieldName) => () => {
    if (inputRefs.current[fieldName]) {
      inputRefs.current[fieldName].focus();
    }
  };

  const handleBlur = (fieldName) => () => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    setFieldErrors(prev => ({ ...prev, [fieldName]: validateField(fieldName, formData[fieldName]) }));
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const validateAll = () => {
    const categoryError = validateField('category', formData.category);
    const descriptionError = validateField('description', formData.description);

    setFieldErrors({ category: categoryError, description: descriptionError });
    setTouched({ category: true, description: true });

    if (categoryError && inputRefs.current.category) {
      inputRefs.current.category.focus();
    } else if (descriptionError && inputRefs.current.description) {
      inputRefs.current.description.focus();
    }

    return !categoryError && !descriptionError;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  useBlockInteraction(isSubmitting);
  const [successMsg, setSuccessMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useSocket(user?.mobileNumber);
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });

  const showError = useCallback((title, message) => {
    setPopup({
      isOpen: true,
      type: 'error',
      title,
      message
    });
  }, []);

  const fetchReports = useCallback(async () => {
    if (!user?.mobileNumber) return;

    try {
      const response = await API.get(`/residents/report/${user?.mobileNumber}`);
      setReports(response?.data || []);
    } catch (error) {
      console.error('Error fetching report history:', error);
      setReports([]);
      showError('History Load Failed', error.response?.data?.message || 'Could not fetch report history.');
    } finally {
      setIsLoading(false);
    }
  }, [showError, user?.mobileNumber]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, photo: file });
      // Create a local URL to preview the image
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearPhoto = () => {
    setFormData({ ...formData, photo: null });
    setPreviewUrl(null);
  };


// API Call for Submit the Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadData = new FormData();
      uploadData.append('name', user?.name);
      uploadData.append('phoneNumber', user?.mobileNumber);
      uploadData.append('category', formData.category);
      uploadData.append('description', formData.description);
      uploadData.append('status', 'Pending');
      if (formData.photo) {
        uploadData.append('photo', formData.photo);
      }

      const response = await minDelay(API.post('/residents/report', uploadData));

      setSuccessMsg(response?.data?.message);
      setFormData({ category: "", description: "", photo: null });
      setFieldErrors({});
      setTouched({});
      setPreviewUrl(null);
      await fetchReports();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);


    } catch (error) {
      console.error('Error submitting report:', error);
      showError('Submit Failed', error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onUpdated = () => fetchReports();
    socket.on('resident:reports-updated', onUpdated);

    return () => socket.off('resident:reports-updated', onUpdated);
  }, [socketRef, fetchReports]);


  return (
    <div className={`${styles.pageWrapper} ${isGuest ? styles.pageWrapperGuest : ''}`}>
      {isSubmitting && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Reporting" />
          </div>
        </div>
      )}
      
      {/* THE EMERALD BLOBS (Vibe Match!) */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest1 : styles.blob1}`}></div>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest2 : styles.blob2}`}></div>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest3 : styles.blob3}`}></div>
      </div>

      <div className={styles.container}>
        
        {/* HEADER: Hub & Spoke Back Navigation */}
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <button className={`${styles.backBtn} ${isGuest ? styles.backBtnGuest : ''}`} onClick={() => navigate('/resident/dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <button className={styles.mobileLogoutBtn} onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? '...' : 'Logout'}
            </button>
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Report an Issue</h1>
            <p className={styles.subTitle}>We're here to help.</p>
          </div>
        </header>

        {successMsg && (
          <div className={styles.successToast}>
            <span>✅</span> {successMsg}
          </div>
        )}

        {isLoading ? <ReportSkeleton /> : (
        <div className={styles.mainGrid}>
          {/* COMPLAINT FORM CARD */}
          <div className={`${styles.glassCard} ${styles.formCard}`}>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              
              {/* Category Dropdown */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Issue Category</label>
              <div className={styles.selectWrapper}>
                <select
                  ref={(el) => inputRefs.current.category = el}
                  className={`${styles.inputField} ${touched.category && fieldErrors.category ? 'input-error' : ''}`}
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  onBlur={handleBlur('category')}
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="electrical">⚡ Electrical (Lights, Fan, AC)</option>
                  <option value="plumbing">🚰 Plumbing (Tap, Flush, Leak)</option>
                  <option value="cleaning">🧹 Cleaning & Housekeeping</option>
                  <option value="wifi">📶 Wi-Fi / Internet</option>
                  <option value="furniture">🪑 Furniture / Bed</option>
                  <option value="other">❓ Other</option>
                </select>
                <div className={styles.selectArrow}>▼</div>
              </div>
              <FormFieldError error={touched.category && fieldErrors.category} onFocus={focusField('category')} />
            </div>

            {/* Description Area */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                ref={(el) => inputRefs.current.description = el}
                className={`${styles.inputField} ${styles.textArea} ${touched.description && fieldErrors.description ? 'input-error' : ''}`}
                placeholder="Please describe the issue in detail (min 10 characters). E.g., 'The AC in room A102 is leaking water...'"
                rows="4"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={handleBlur('description')}
              ></textarea>
              <FormFieldError error={touched.description && fieldErrors.description} onFocus={focusField('description')} />
            </div>

            {/* Photo Upload Zone */}
            <div className={styles.inputGroup}>
              <div className={styles.labelWithClear}>
                <label className={styles.label}>Attach Photo (Optional)</label>
                {formData.photo && (
                  <button 
                    type="button" 
                    className={styles.clearFileBtn} 
                    onClick={handleClearPhoto}
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {previewUrl ? (
                <div className={styles.imagePreviewContainer}>
                  <img src={previewUrl} alt="Preview" className={styles.imagePreview} />
                </div>
              ) : (
                <label className={styles.uploadZone}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className={styles.hiddenInput} 
                    onChange={handleFileChange}
                  />
                  <div className={styles.uploadContent}>
                    <div className={styles.uploadIcon}>📸</div>
                    <span className={styles.uploadText}>
                      Tap to upload a photo
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className={`${styles.submitBtn} ${isGuest ? styles.submitBtnGuest : ''}`} disabled={isSubmitting}>
              Raise Ticket
            </button>

          </form>
        </div>

        {/* RECENT TICKETS SUMMARY (Optional Vibe Addition) */}
        <div className={`${styles.glassCard} ${styles.historyCard}`}>
          <h3 className={styles.historyTitle}>Recent Tickets</h3>
          {reports.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '20px', fontSize: '14px' }}>
              No reports found. Your reported issues will appear here.
            </p>
          ) : (
            <div className={styles.ticketList}>
              {reports.map((report) => (
                <div key={report._id} className={styles.ticketItem}>
                  <div className={styles.ticketLeft}>
                    <span className={`${styles.ticketIcon} ${isGuest ? styles.ticketIconGuest : ''}`}>{categoryIcons[report.category] || "❓"}</span>
                    <div>
                      <p className={styles.ticketName}>{report.description}</p>
                      <small className={styles.ticketDate}>Reported on {new Date(report.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <span className={report.status === 'Resolved' ? styles.badgeResolved : styles.badgePending}>{report.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        </div>
        )}

      </div>

      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        type={popup.type}
        title={popup.title}
        message={popup.message}
      />
    </div>
  );
}