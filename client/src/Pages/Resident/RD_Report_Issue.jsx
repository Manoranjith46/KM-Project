import { useCallback, useEffect, useState } from "react";
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
                  className={styles.inputField} 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
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
            </div>

            {/* Description Area */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Description</label>
              <textarea 
                className={`${styles.inputField} ${styles.textArea}`} 
                placeholder="Please describe the issue in detail. E.g., 'The AC in room A102 is leaking water...'"
                rows="4"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
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