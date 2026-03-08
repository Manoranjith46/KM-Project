import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RD_Finance.module.css";
import API from '../../API/axios';
import { useAuth } from '../../Context/AuthContext';
import Loader from './Components/Loader/Loader';
import Popup from './Components/popup/Popup';
import { FinanceSkeleton } from './Components/Skeleton/Skeleton';

export default function Resident_Finance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'upi':
        return '📱';
      case 'cash':
        return '💵';
      case 'bank transfer':
        return '🏦';
      case 'card':
        return '💳';
      default:
        return '💰';
    }
  };

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

  // Payment History State
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [totalSpending, setTotalSpending] = useState(0);
  const [currentDues, setCurrentDues] = useState(0);

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


// Backend Integrations

  // Fetch Due from API
  const fetchPaymentHistory = useCallback(async () => {
    if (!user?.mobileNumber) return;
    
    setHistoryLoading(true);
    try {
      const response = await API.get(`/payments/${user.mobileNumber}`);
      let payments = [];
      
      if (response?.data && Array.isArray(response.data)) {
        payments = response.data;
      } else if (response?.data?.payments && Array.isArray(response.data.payments)) {
        payments = response.data.payments;
      }

      // Transform data to match UI expectations
      const formattedPayments = payments.map((payment, index) => ({
        id: payment._id || index,
        month: new Date(payment.date).toLocaleString("en-US", { month: "long", year: "numeric" }),
        amount: `₹${payment.amount.toLocaleString('en-IN')}`,
        date: new Date(payment.date).toLocaleDateString('en-IN'),
        paymentMethod: payment.paymentMethod,
        status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1), // Capitalize first letter
      }));
      
      // Calculate total spending from approved payments only
      const total = payments.reduce((sum, payment) => {
        const isApproved = String(payment?.status || '').toLowerCase() === 'approved';
        const amount = Number(payment?.amount) || 0;
        return isApproved ? sum + amount : sum;
      }, 0);
      setTotalSpending(total);
      
      setHistory(formattedPayments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Failed to Load History',
        message: 'Could not fetch payment history. Please try again later.'
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.mobileNumber]);

  // Fetch current dues from API
  const fetchCurrentDues = useCallback(async () => {
    if (!user?.mobileNumber) return;
    
    try {
      const response = await API.get(`/payments/dues/${user.mobileNumber}`);
      if (response?.data?.dueAmount !== undefined) {
        setCurrentDues(response.data.dueAmount);
      }
    } catch (error) {
      console.error('Error fetching current dues:', error);
    }
  }, [user?.mobileNumber]);

// Fetch payment history and dues on component mount
  useEffect(() => {
    Promise.all([fetchPaymentHistory(), fetchCurrentDues()]).finally(() => setPageLoading(false));
  }, [fetchPaymentHistory, fetchCurrentDues]);


// API Call for submitting payment data
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate user
    if (!user?.name || !user?.mobileNumber) {
      setWarningMsg("User information not found. Please log in again.");
      return;
    }

    // Validate amount
    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      setWarningMsg("Please enter a valid amount.");
      return;
    }

    // Validate receipt
    if (!paymentData.receipt) {
      setWarningMsg("Please upload a payment screenshot before submitting.");
      return;
    }

    setWarningMsg("");
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('phoneNumber', user.mobileNumber);
      formData.append('amount', Number(paymentData.amount));
      formData.append('date', new Date(paymentData.date).toISOString());
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('paymentProof', paymentData.receipt);

      const response = await API.post('/payments/online', formData);

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

      // Refresh payment history after successful submission
      fetchPaymentHistory();
      fetchCurrentDues();
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

        {pageLoading ? <FinanceSkeleton /> : (
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
                <h3 className={styles.statValue}>₹{totalSpending.toLocaleString('en-IN')}</h3>
              </div>
              <div className={`${styles.glassCard} ${styles.statCard}`}>
                <p className={styles.statLabel}>Current Dues</p>
                <h3 className={`${styles.statValue} ${currentDues === 0 ? styles.textGreen : ''}`}>
                  ₹{currentDues.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>

            <div className={`${styles.glassCard} ${styles.historyCard}`}>
              <h2 className={styles.cardTitle}>Payment History</h2>
              
              {historyLoading ? (
                <p className={styles.historyEmptyText}>Loading payment history...</p>
              ) : history.length === 0 ? (
                <p className={styles.historyEmptyText}>No payments found</p>
              ) : (
              <div className={styles.historyList}>
                {history.map((tx) => (
                  <div key={tx.id} className={styles.historyItem}>
                    <div className={styles.historyLeft}>
                      <div className={styles.historyIcon}>{getPaymentIcon(tx.paymentMethod)}</div>
                      <div>
                        <p className={styles.historyMonth}>{tx.month}</p>
                        <small className={styles.historyDate}>{tx.date}</small>
                      </div>
                    </div>
                    <div className={styles.historyRight}>
                      <p className={styles.historyAmount}>{tx.amount}</p>
                      <span className={`${styles.statusBadge} ${tx.status === 'Approved' ? styles.badgeGreen : styles.badgePending}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              )}

            </div>
          </div>

        </div>
        )}
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