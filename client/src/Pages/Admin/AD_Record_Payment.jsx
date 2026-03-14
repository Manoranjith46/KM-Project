import { useState, useRef } from "react";
import styles from "./AD_Record_Payment.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import Loader from "./Components/Loader/Loader";
import { useNavigate } from "react-router-dom";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";
import useBlockInteraction from "../../hooks/useBlockInteraction";
import { validators } from "../../utils/validators";
import { FormFieldError } from "../../Components/FormError";

export default function Admin_Record_Payment() {

  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useBlockInteraction(isSubmitting);
  const [error, setError] = useState("");

  // Validation state
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const inputRefs = useRef({});

  // Form state for Manual Cash Entry
  const [cashForm, setCashForm] = useState({
    resident: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const validateField = (field, value) => {
    if (field === 'resident') return validators.phone(value, true);
    if (field === 'amount') return validators.positiveNumber(value, 'Amount');
    return '';
  };

  const focusField = (fieldName) => () => {
    if (inputRefs.current[fieldName]) {
      inputRefs.current[fieldName].focus();
    }
  };

  const handleCashChange = (e) => {
    let { name, value } = e.target;

    // Only allow digits for phone number
    if (name === 'resident') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setCashForm({ ...cashForm, [name]: value });
    setError('');

    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (fieldName) => () => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    setFieldErrors(prev => ({ ...prev, [fieldName]: validateField(fieldName, cashForm[fieldName]) }));
  };

  const validateAll = () => {
    const residentError = validateField('resident', cashForm.resident);
    const amountError = validateField('amount', cashForm.amount);

    setFieldErrors({ resident: residentError, amount: amountError });
    setTouched({ resident: true, amount: true });

    if (residentError && inputRefs.current.resident) {
      inputRefs.current.resident.focus();
    } else if (amountError && inputRefs.current.amount) {
      inputRefs.current.amount.focus();
    }

    return !residentError && !amountError;
  };

  const handleGoBack = () => {
    navigate('/admin/payments');
  };

  const handleSubmitCash = async () => {
    setError("");

    if (!validateAll()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await minDelay((async () => {
        const { data: occData } = await API.get("/admin/occupants");
        const match = (occData.occupants || []).find(
          (r) => r.phoneNumber === cashForm.resident
        );
        if (!match) {
          setError("No resident found with this mobile number.");
          return;
        }
        await API.post("/payments/cash", {
          name: match.name,
          phoneNumber: cashForm.resident,
          amount: Number(cashForm.amount),
          date: cashForm.date || new Date().toISOString(),
        });
        navigate("/admin/payments");
      })());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className={styles.dashboardWrapper}>
      {/* Floating Background Blobs */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath={"payments"} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.backBtn} onClick={handleGoBack} aria-label="Go Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Record Payment</h1>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.formContainer}>
            
              <div className={styles.tabContentFade}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>Manual Cash Entry</h3>
                  <p className={styles.formSubtext}>Record a payment received in cash directly from a resident.</p>
                </div>

                <div className={styles.formGrid}>
                  <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="resident">Resident Mobile Number</label>
                    <input
                      ref={(el) => inputRefs.current.resident = el}
                      id="resident"
                      name="resident"
                      type="tel"
                      className={`${styles.input} ${touched.resident && fieldErrors.resident ? 'input-error' : ''}`}
                      placeholder="e.g. 9876543210"
                      value={cashForm.resident}
                      onChange={handleCashChange}
                      onBlur={handleBlur('resident')}
                    />
                    <FormFieldError error={touched.resident && fieldErrors.resident} onFocus={focusField('resident')} />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="amount">Amount Received (₹)</label>
                    <input
                      ref={(el) => inputRefs.current.amount = el}
                      id="amount"
                      name="amount"
                      type="number"
                      className={`${styles.input} ${touched.amount && fieldErrors.amount ? 'input-error' : ''}`}
                      placeholder="e.g. 8500"
                      value={cashForm.amount}
                      onChange={handleCashChange}
                      onBlur={handleBlur('amount')}
                    />
                    <FormFieldError error={touched.amount && fieldErrors.amount} onFocus={focusField('amount')} />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="date">Payment Date</label>
                    <input id="date" name="date" type="date" className={styles.input} value={cashForm.date} onChange={handleCashChange} />
                  </div>

                  <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="notes">Remarks / Notes (Optional)</label>
                    <input id="notes" name="notes" className={styles.input} placeholder="e.g. Paid in full for Feb" value={cashForm.notes} onChange={handleCashChange} />
                  </div>
                </div>

                <div className={styles.formFooter}>
                  {error && <p className={styles.errorText}>{error}</p>}
                  <hr className={styles.divider} />
                  <div className={styles.footerActions}>
                    <button className={styles.cancelBtn} onClick={handleGoBack}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSubmitCash} disabled={isSubmitting}>
                      {isSubmitting ? "Recording..." : "Record Cash Payment"}
                    </button>
                  </div>
                </div>
              </div>

          </div>
        </div>
      </main>

      {isSubmitting && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Recording..." />
          </div>
        </div>
      )}
    </div>
  );
}
