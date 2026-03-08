import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RD_Finance.module.css";
import API from '../../API/axios';
import { encodeImageToBase64 } from '../../Components/ImageConverter';
import { useAuth } from '../../Context/AuthContext';
import Loader from './Components/Loader/Loader';
import Popup from './Components/popup/Popup';

export default function Resident_Finance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    month: currentMonth,
    paymentMethod: "UPI",
    date: new Date().toISOString().split('T')[0],
    receipt: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [receiptPreview, setReceiptPreview] = useState("");
  const fileInputRef = useRef(null);
  
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Mock History Data
  const [history] = useState([
    { id: 1, month: "February 2026", amount: "₹6,500", date: "02 Feb 2026", paymentMethod: "UPI", status: "Approved" },
    { id: 2, month: "January 2026", amount: "₹6,500", date: "05 Jan 2026", paymentMethod: "Bank Transfer", status: "Approved" },
    { id: 3, month: "December 2025", amount: "₹6,500", date: "01 Dec 2025", paymentMethod: "Screenshot Upload", status: "Approved" },
    { id: 4, month: "February 2026", amount: "₹6,500", date: "02 Feb 2026", paymentMethod: "UPI", status: "Approved" },
    { id: 5, month: "January 2026", amount: "₹6,500", date: "05 Jan 2026", paymentMethod: "Bank Transfer", status: "Approved" },
    { id: 6, month: "December 2025", amount: "₹6,500", date: "01 Dec 2025", paymentMethod: "Screenshot Upload", status: "Approved" },
  ]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setWarningMsg("");
      setPaymentData({ ...paymentData, receipt: selectedFile });
      setReceiptPreview((previousPreview) => {
        if (previousPreview) {
          URL.revokeObjectURL(previousPreview);
        }
        return URL.createObjectURL(selectedFile);
      });
    }
  };

  const handleClearReceipt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptPreview("");
    setPaymentData({ ...paymentData, receipt: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentData.receipt) {
      setWarningMsg("Please upload a payment screenshot before submitting.");
      return;
    }

    setWarningMsg("");
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: user?.name,
        phoneNumber: user?.mobileNumber,
        amount: Number(paymentData.amount),
        date: new Date(paymentData.date),
        paymentMethod: paymentData.paymentMethod,
        paymentProof: null,
      };

      if (paymentData.receipt) {
        payload.paymentProof = await encodeImageToBase64(paymentData.receipt);
      }

      const response = await API.post('/payments/online', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setPopup({
        isOpen: true,
        type: 'success',
        title: 'Payment Submitted!',
        message: response?.data?.message || 'Receipt uploaded! Awaiting admin approval.'
      });
      
      setPaymentData({ 
        amount: "", 
        month: currentMonth, 
        paymentMethod: "UPI",
        date: new Date().toISOString().split('T')[0],
        receipt: null 
      });
      setReceiptPreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.message || 'Failed to submit payment. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {isSubmitting && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Submitting" />
          </div>
        </div>
      )}
      
      {/* THE EMERALD BLOBS */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <div className={styles.container}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Finance & Payments</h1>
            <p className={styles.subTitle}>Manage your dues and history</p>
          </div>
        </header>

        <div className={styles.mainGrid}>
          
          {/* LEFT COLUMN: UPLOAD FORM */}
          <div className={styles.leftCol}>
            <div className={styles.glassCard}>
              <h2 className={styles.cardTitle}>Pay Rent / Dues</h2>
              <p className={styles.cardDesc}>Upload your payment screenshot for verification.</p>
              
              <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Amount Paid (₹)</label>
                    <input 
                      type="number" 
                      className={styles.inputField} 
                      placeholder="e.g. 6500"
                      required
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Payment Method</label>
                    <div className={styles.selectWrapper}>
                      <select 
                        className={styles.inputField} 
                        required
                        value={paymentData.paymentMethod}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                      >
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className={styles.selectArrow}>▼</div>
                    </div>
                  </div>
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>For Month</label>
                    <div className={styles.selectWrapper}>
                      <select 
                        className={styles.inputField} 
                        required
                        value={paymentData.month}
                        onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
                      >
                        {monthOptions.map((month) => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                      <div className={styles.selectArrow}>▼</div>
                    </div>
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Payment Date</label>
                    <input 
                      type="date" 
                      className={styles.inputField}
                      max={new Date().toISOString().split('T')[0]}
                      required
                      value={paymentData.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.labelWithClear}>
                    <label className={styles.label}>Upload Screenshot</label>
                    {paymentData.receipt && (
                      <button 
                        type="button" 
                        className={styles.clearPreviewBtn} 
                        onClick={handleClearReceipt}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <label className={styles.uploadZone}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className={styles.hiddenInput} 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <div className={styles.uploadContent}>
                      {receiptPreview ? (
                        <>
                          <img
                            src={receiptPreview}
                            alt="Uploaded receipt"
                            className={styles.uploadPreview}
                          />
                          <span className={styles.uploadText}>{paymentData.receipt?.name}</span>
                        </>
                      ) : (
                        <>
                          <div className={styles.uploadIcon}>🧾</div>
                          <span className={styles.uploadText}>Tap to attach screenshot</span>
                        </>
                      )}
                    </div>
                  </label>
                  {warningMsg && (
                    <p className={styles.warningText}>{warningMsg}</p>
                  )}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? <span className={styles.loader}></span> : "Submit Receipt"}
                </button>
              </form>

            </div>
          </div>

          {/* RIGHT COLUMN: STATS & HISTORY (Untouched) */}
          <div className={styles.rightCol}>
            
            <div className={styles.statsGrid}>
              <div className={`${styles.glassCard} ${styles.statCard}`}>
                <p className={styles.statLabel}>Total Spendings</p>
                <h3 className={styles.statValue}>₹45,500</h3>
              </div>
              <div className={`${styles.glassCard} ${styles.statCard}`}>
                <p className={styles.statLabel}>Current Dues</p>
                <h3 className={`${styles.statValue} ${styles.textGreen}`}>₹0</h3>
              </div>
            </div>

            <div className={`${styles.glassCard} ${styles.historyCard}`}>
              <h2 className={styles.cardTitle}>Payment History</h2>
              
              <div className={styles.historyList}>
                {history.map((tx) => (
                  <div key={tx.id} className={styles.historyItem}>
                    <div className={styles.historyLeft}>
                      <div className={styles.historyIcon}>💸</div>
                      <div>
                        <p className={styles.historyMonth}>{tx.month}</p>
                        <small className={styles.historyDate}>{tx.date}</small>
                      </div>
                    </div>
                    <div className={styles.historyRight}>
                      <p className={styles.historyAmount}>{tx.amount}</p>
                      <span className={styles.methodBadge}>{tx.paymentMethod}</span>
                      <span className={`${styles.statusBadge} ${tx.status === 'Approved' ? styles.badgeGreen : styles.badgePending}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
      
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        type={popup.type}
        title={popup.title}
        message={popup.message}
      />
    </div>
  );
}