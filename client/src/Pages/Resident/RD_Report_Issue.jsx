import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./RD_Report_Issue.module.css";

export default function Resident_ReportIssue() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    photo: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const mockTickets = [
    { id: 1, title: "Leaking Tap", date: "28 Feb", status: "Resolved", icon: "🚰" },
    { id: 2, title: "Wifi Router off", date: "25 Feb", status: "Pending", icon: "📶" },
    { id: 3, title: "Broken Chair", date: "20 Feb", status: "Resolved", icon: "🪑" },
    { id: 4, title: "Leaking Tap", date: "28 Feb", status: "Resolved", icon: "🚰" },
    { id: 5, title: "Wifi Router off", date: "25 Feb", status: "Pending", icon: "📶" },
    { id: 6, title: "Broken Chair", date: "20 Feb", status: "Resolved", icon: "🪑" },
    { id: 7, title: "Leaking Tap", date: "28 Feb", status: "Resolved", icon: "🚰" },
    { id: 8, title: "Wifi Router off", date: "25 Feb", status: "Pending", icon: "📶" },
    { id: 9, title: "Broken Chair", date: "20 Feb", status: "Resolved", icon: "🪑" }
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("Ticket raised successfully! We will fix this ASAP.");
      setFormData({ category: "", description: "", photo: null });
      setPreviewUrl(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1500);
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* THE EMERALD BLOBS (Vibe Match!) */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <div className={styles.container}>
        
        {/* HEADER: Hub & Spoke Back Navigation */}
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
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
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className={styles.loader}></span>
              ) : (
                "Raise Ticket"
              )}
            </button>

          </form>
        </div>

        {/* RECENT TICKETS SUMMARY (Optional Vibe Addition) */}
        <div className={`${styles.glassCard} ${styles.historyCard}`}>
          <h3 className={styles.historyTitle}>Recent Tickets</h3>
          <div className={styles.ticketList}>
            {mockTickets.map((ticket) => (
              <div key={ticket.id} className={styles.ticketItem}>
                <div className={styles.ticketLeft}>
                  <span className={styles.ticketIcon}>{ticket.icon}</span>
                  <div>
                    <p className={styles.ticketName}>{ticket.title}</p>
                    <small className={styles.ticketDate}>Reported on {ticket.date}</small>
                  </div>
                </div>
                <span className={ticket.status === 'Resolved' ? styles.badgeResolved : styles.badgePending}>{ticket.status}</span>
              </div>
            ))}
          </div>
        </div>

        </div>

      </div>
    </div>
  );
}