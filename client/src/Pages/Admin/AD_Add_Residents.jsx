import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import styles from './AD_Add_Residents.module.css';
import Sidebar from "./Components/Sidebar/Sidebar";
import { getCroppedImg, handleFileChange, handleCropUpload, handleClearPreview, handleCloseCropModal, handleResetCrop } from "../../Components/ImageCrop";
import Popup from "./Components/Popup/Popup";
import Loader from "../Resident/Components/Loader/Loader";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";

export default function Admin_AddResident() {
  const navigate = useNavigate(); 
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, type: '', title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const [activeNav, setActiveNav] = useState("residents");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set joining date to today's date on component mount
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    
    setForm(prevForm => ({
      ...prevForm,
      joiningDate: todayFormatted
    }));
  }, []);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    gender: "Male",
    bloodGroup: "",
    emerName: "",
    emerRelation: "",
    emerPhone: "",
    type: "Resident",
    roomNo: "",
    joiningDate: "",
    rentAmount: "",
    depositAmount: "",
    document: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  // File upload and crop states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempPreviewUrl, setTempPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'This field is required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters are allowed';
        return '';

      case 'phone':
      case 'emerPhone':
        if (!value.trim()) return 'Phone number is required';
        const cleanPhone = value.replace(/\s+/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          return 'Enter a valid 10-digit phone number';
        }
        return '';

      case 'dob':
        if (!value) return 'Date of birth is required';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) return 'Resident must be at least 18 years old';
        if (age > 100) return 'Please enter a valid date of birth';
        return '';

      case 'bloodGroup':
        if (value && !/^(A|B|AB|O)[+-]$/.test(value)) {
          return 'Enter valid blood group (e.g., A+, B-, O+)';
        }
        return '';

      case 'emerName':
        if (!value.trim()) return 'Emergency contact name is required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        return '';

      case 'emerRelation':
        if (!value.trim()) return 'Relationship is required';
        return '';

      case 'roomNo':
        if (!value) return 'Please select a room';
        return '';

      case 'type':
        if (!value) return 'Please select a type';
        return '';

      case 'joiningDate':
        if (!value) return 'Joining date is required';
        const moveDate = new Date(value);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        moveDate.setHours(0, 0, 0, 0);
        if (moveDate > todayDate) return 'Joining date cannot be in the future';
        return '';

      case 'rentAmount':
        if (form.type === 'Guest') return '';
        if (!value) return 'Rent amount is required';
        if (isNaN(value) || Number(value) <= 0) {
          return 'Enter a valid amount greater than 0';
        }
        return '';

      case 'depositAmount':
        if (form.type === 'Guest') return '';
        if (!value) return 'Deposit amount is required';
        if (isNaN(value) || Number(value) <= 0) {
          return 'Enter a valid amount greater than 0';
        }
        return '';

      case 'document':
        if (!value) return 'Identity document is required';
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'application/pdf'];
        if (!allowedTypes.includes(value.type)) {
          return 'Only JPG, PNG, SVG, or PDF files are allowed';
        }
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (value.size > maxSize) {
          return 'File size must be less than 5MB';
        }
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Hide error summary when user starts fixing errors
    if (showErrorSummary) {
      setShowErrorSummary(false);
    }
    
    // Validate the field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleFileChangeClick = (e) => {
    handleFileChange(e, setTempPreviewUrl, setShowCropModal, setErrors, setTouched);
  };

  const handleResetCropClick = () => {
    handleResetCrop(setCrop, setZoom);
  };

  // Handle crop complete
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle upload after crop
  const handleCropUploadClick = async () => {
    await handleCropUpload(tempPreviewUrl, croppedAreaPixels, setPreviewUrl, setForm, setShowCropModal, setTouched, setErrors, form, touched, errors);
  };

  // Handle close crop modal
  const handleCloseCropModalClick = () => {
    handleCloseCropModal(setShowCropModal, setTempPreviewUrl, setCrop, setZoom);
  };

  // Handle clear preview
  const handleClearPreviewClick = () => {
    handleClearPreview(setPreviewUrl, setForm, form);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleGoBack = () => {
    navigate('/admin/residents');
  };


// An API Call to Add Resident
  const handleNewResident = async (e) => {
    // If you are using a <form> wrapper, e.preventDefault() stops the page from reloading
    if (e) e.preventDefault(); 

    // Validate all fields before submission
    const newErrors = {};
    const fieldsToValidate = [
      'firstName', 'lastName', 'phone', 'dob',
      'bloodGroup', 'emerName', 'emerRelation', 'emerPhone',
      'type', 'roomNo', 'joiningDate', 'document',
      ...(form.type !== 'Guest' ? ['rentAmount', 'depositAmount'] : [])
    ];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, form[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Mark all fields as touched
    const allTouched = {};
    fieldsToValidate.forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // If there are errors, show them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowErrorSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Build FormData for multipart upload
      const formData = new FormData();
      formData.append('name', `${form.firstName} ${form.lastName}`.trim());
      formData.append('phoneNumber', form.phone);
      formData.append('type', form.type);
      formData.append('dob', form.dob);
      formData.append('gender', form.gender);
      formData.append('bloodGroup', form.bloodGroup);
      formData.append('guardianDetails', JSON.stringify({
        name: form.emerName,
        phone: form.emerPhone,
        relation: form.emerRelation
      }));
      formData.append('roomNumber', form.roomNo);
      formData.append('joiningDate', form.joiningDate);
      if (form.type !== 'Guest') {
        formData.append('monthlyRent', form.rentAmount);
        formData.append('securityDeposit', form.depositAmount);
      }
      if (form.document) {
        formData.append('document', form.document);
      }

      // 2. Send the data to your backend
      const response = await minDelay(API.post('/residents', formData));

      // 3. Parse the response from the backend
      const data = response.data;
      console.log('Backend response:', data, 'Status:', response.status);

      // 4. Check if the response was successful
      if (response.status === 201 || response.status === 200) {
        setPopupConfig({
          isOpen: true,
          type: 'success',
          title: 'Success!',
          message: data.message || 'Resident added successfully.' 
        });
        
        // Reset the form after successful submission
        setForm({
          firstName: "",
          lastName: "",
          phone: "",
          dob: "",
          gender: "Male",
          bloodGroup: "",
          emerName: "",
          emerRelation: "",
          emerPhone: "",
          type: "Resident",
          roomNo: "",
          joiningDate: "",
          rentAmount: "",
          depositAmount: "",
          document: null,
        });
        setPreviewUrl(null);
        setTouched({});
        setErrors({});
        setShowErrorSummary(false);

      } else {
        // 5. Handle unexpected responses
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPopupConfig({
          isOpen: true,
          type: 'error',
          title: 'Registration Failed',
          message: data.message || 'Please check the details and try again.'
        });
      }
    } catch (error) {
      // 6. Handle errors (auth, validation, network, etc.)
      console.error('Error submitting form:', error);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      let errorMessage = 'Could not connect to the server. Please try again later.';
      
      // Handle axios response errors
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Handle 401/403 auth errors
      else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'You are not authorized to add residents. Only owners can add residents.';
      }

      setPopupConfig({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
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

      <Sidebar currentPath={"residents"} />

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button onClick={handleGoBack} className={styles.backBtn} aria-label="Go Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Add New Resident</h1>
            </div>
          </div>

        </header>

        <div className={styles.content}>
          <div className={styles.formContainer}>
            
            {/* Error Summary Banner */}
            {showErrorSummary && Object.keys(errors).length > 0 && (
              <div className={styles.errorBanner}>
                <div className={styles.errorBannerIcon}>⚠️</div>
                <div className={styles.errorBannerContent}>
                  <h4 className={styles.errorBannerTitle}>Please fix the following errors:</h4>
                  <ul className={styles.errorBannerList}>
                    {Object.entries(errors).map(([field, error]) => (
                      error && <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 1. Personal Information */}
            <section className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>Personal Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="firstName">
                    First Name <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="firstName" 
                    name="firstName" 
                    className={`${styles.input} ${errors.firstName && touched.firstName ? styles.inputError : ''}`}
                    placeholder="e.g. Rahul" 
                    value={form.firstName} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.firstName && touched.firstName && (
                    <span className={styles.errorText}>{errors.firstName}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="lastName">
                    Last Name <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="lastName" 
                    name="lastName" 
                    className={`${styles.input} ${errors.lastName && touched.lastName ? styles.inputError : ''}`}
                    placeholder="e.g. Sharma" 
                    value={form.lastName} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.lastName && touched.lastName && (
                    <span className={styles.errorText}>{errors.lastName}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="phone">
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    className={`${styles.input} ${errors.phone && touched.phone ? styles.inputError : ''}`}
                    placeholder="9876543210" 
                    value={form.phone} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="10"
                  />
                  {errors.phone && touched.phone && (
                    <span className={styles.errorText}>{errors.phone}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="dob">
                    Date of Birth <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="dob" 
                    name="dob" 
                    type="date" 
                    className={`${styles.input} ${errors.dob && touched.dob ? styles.inputError : ''}`}
                    value={form.dob} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.dob && touched.dob && (
                    <span className={styles.errorText}>{errors.dob}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="gender">Gender</label>
                  <select 
                    id="gender" 
                    name="gender" 
                    className={styles.select} 
                    value={form.gender} 
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="bloodGroup">Blood Group</label>
                  <input 
                    id="bloodGroup" 
                    name="bloodGroup" 
                    className={`${styles.input} ${errors.bloodGroup && touched.bloodGroup ? styles.inputError : ''}`}
                    placeholder="e.g. A+, B-, O+" 
                    value={form.bloodGroup} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="3"
                  />
                  {errors.bloodGroup && touched.bloodGroup && (
                    <span className={styles.errorText}>{errors.bloodGroup}</span>
                  )}
                </div>
              </div>
            </section>

            {/* 2. Emergency Contact */}
            <section className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>Emergency Contact</h3>
              <div className={styles.formGrid}>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="emerName">
                    Contact Name <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="emerName" 
                    name="emerName" 
                    className={`${styles.input} ${errors.emerName && touched.emerName ? styles.inputError : ''}`}
                    placeholder="Full Name" 
                    value={form.emerName} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.emerName && touched.emerName && (
                    <span className={styles.errorText}>{errors.emerName}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="emerRelation">
                    Relationship <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="emerRelation" 
                    name="emerRelation" 
                    className={`${styles.input} ${errors.emerRelation && touched.emerRelation ? styles.inputError : ''}`}
                    placeholder="e.g. Father, Sister" 
                    value={form.emerRelation} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.emerRelation && touched.emerRelation && (
                    <span className={styles.errorText}>{errors.emerRelation}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="emerPhone">
                    Contact Phone <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="emerPhone" 
                    name="emerPhone" 
                    type="tel" 
                    className={`${styles.input} ${errors.emerPhone && touched.emerPhone ? styles.inputError : ''}`}
                    placeholder="9876543210" 
                    value={form.emerPhone} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="10"
                  />
                  {errors.emerPhone && touched.emerPhone && (
                    <span className={styles.errorText}>{errors.emerPhone}</span>
                  )}
                </div>
              </div>
            </section>

            {/* 3. Room & Stay Details */}
            <section className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>Room & Allocation</h3>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="roomNo">
                    Assign Room <span className={styles.required}>*</span>
                  </label>
                  <select 
                    id="roomNo" 
                    name="roomNo" 
                    className={`${styles.select} ${errors.roomNo && touched.roomNo ? styles.inputError : ''}`}
                    value={form.roomNo} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select Room</option>
                    <option value="101">101 (Available)</option>
                    <option value="102">102 (Available)</option>
                    <option value="205">205 (Available)</option>
                  </select>
                  {errors.roomNo && touched.roomNo && (
                    <span className={styles.errorText}>{errors.roomNo}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="type">
                    Type <span className={styles.required}>*</span>
                  </label>
                  <select 
                    id="type" 
                    name="type" 
                    className={`${styles.select} ${errors.type && touched.type ? styles.inputError : ''}`}
                    value={form.type} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="Resident">Resident</option>
                    <option value="Guest">Guest</option>
                  </select>
                  {errors.type && touched.type && (
                    <span className={styles.errorText}>{errors.type}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="joiningDate">
                    Joining Date <span className={styles.required}>*</span>
                  </label>
                  <input 
                    id="joiningDate" 
                    name="joiningDate" 
                    type="date" 
                    className={`${styles.input} ${errors.joiningDate && touched.joiningDate ? styles.inputError : ''}`}
                    value={form.joiningDate} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.joiningDate && touched.joiningDate && (
                    <span className={styles.errorText}>{errors.joiningDate}</span>
                  )}
                </div>
                {form.type !== 'Guest' && (
                  <>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="rentAmount">
                        Monthly Rent (₹) <span className={styles.required}>*</span>
                      </label>
                      <input 
                        id="rentAmount" 
                        name="rentAmount" 
                        type="number" 
                        className={`${styles.input} ${errors.rentAmount && touched.rentAmount ? styles.inputError : ''}`}
                        placeholder="5000" 
                        value={form.rentAmount} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min="0"
                      />
                      {errors.rentAmount && touched.rentAmount && (
                        <span className={styles.errorText}>{errors.rentAmount}</span>
                      )}
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                      <label className={styles.label} htmlFor="depositAmount">
                        Security Deposit (₹) <span className={styles.required}>*</span>
                      </label>
                      <input 
                        id="depositAmount" 
                        name="depositAmount" 
                        type="number" 
                        className={`${styles.input} ${errors.depositAmount && touched.depositAmount ? styles.inputError : ''}`}
                        placeholder="10000" 
                        value={form.depositAmount} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min="0"
                      />
                      {errors.depositAmount && touched.depositAmount && (
                        <span className={styles.errorText}>{errors.depositAmount}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* 4. Aadhar Card Upload */}
            <section className={styles.subSection}>
              <h3 className={styles.subSectionTitle}>
                Aadhar Card <span className={styles.required}>*</span>
              </h3>
              <p className={styles.subtext}>Upload and crop your Aadhar card. Supported: JPG, PNG (max. 5MB) | Recommended: 85.6mm × 53.98mm</p>
              
              <div className={styles.uploadSignatureSection}>
                <div className={styles.uploadSignatureTitleWrapper}>
                  <h5 className={styles.uploadSignatureTitle}>Aadhar Card Upload & Crop:</h5>
                  {previewUrl && (
                    <button 
                      className={styles.clearBtn}
                      type="button"
                      onClick={handleClearPreviewClick}
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div 
                  className={`${styles.uploadSignatureBox} ${errors.document && touched.document ? styles.uploadBoxError : ''}`}
                  onClick={!previewUrl ? () => document.querySelector('.upload-file-input')?.click() : undefined}
                >
                  {previewUrl ? (
                    <div className={styles.imageContainer}>
                      <img src={previewUrl} alt="Aadhar Card Preview" className={styles.documentPreview} />
                    </div>
                  ) : (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--pg-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className={styles.uploadSignatureText}>Click to upload or drag and drop</p>
                      <p className={styles.uploadSignatureSubtext}>PNG, JPG (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                
                <input 
                  type="file" 
                  className="upload-file-input"
                  style={{ display: 'none' }}
                  aria-label="Upload document"
                  onChange={handleFileChangeClick}
                  accept=".jpg,.jpeg,.png"
                />
              </div>
              
              {errors.document && touched.document && (
                <span className={styles.errorText}>{errors.document}</span>
              )}
            </section>

            {/* Actions */}
            <div className={styles.formFooter}>
              <hr className={styles.divider} />
              <div className={styles.footerActions}>
                <button className={styles.cancelBtn} onClick={handleGoBack}>Cancel</button>
                <button className={styles.saveBtn} onClick={handleNewResident} >Register Resident</button>
              </div>
            </div>

          </div>
        </div>
        {showCropModal && (
          <div className={styles.cropModalOverlay}>
            <div className={styles.cropModal}>
              
              {/* Header */}
              <div className={styles.cropModalHeader}>
                <h2 className={styles.cropModalTitle}>Crop Aadhar Card</h2>
                <button 
                  className={styles.cropModalCloseBtn} 
                  type="button"
                  aria-label="Close modal"
                  onClick={handleCloseCropModalClick}
                >
                  ✕
                </button>
              </div>

              {/* Cropper Area */}
              <div className={styles.cropperArea}>
                {tempPreviewUrl && (
                  <Cropper
                    image={tempPreviewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={3.5 / 2.25}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                )}
              </div>

              {/* Zoom Slider */}
              <div className={styles.cropZoomContainer}>
                <label htmlFor="zoom-slider" className={styles.zoomLabel}>Zoom:</label>
                <input
                  id="zoom-slider"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles.zoomSlider}
                />
              </div>

              {/* Size Hint */}
              <p className={styles.cropSizeHint}>
                Standard Aadhar Card Size: 85.6mm × 53.98mm (adjust crop area to match)
              </p>

              {/* Footer Actions */}
              <div className={styles.cropModalFooter}>
                <button 
                  className={styles.cropResetBtn}
                  type="button"
                  onClick={handleResetCropClick}
                >
                  Reset
                </button>
                <button 
                  className={styles.cropCancelBtn}
                  type="button"
                  onClick={handleCloseCropModalClick}
                >
                  Cancel
                </button>
                <button 
                  className={styles.cropUploadBtn}
                  type="button"
                  onClick={handleCropUploadClick}
                >
                  Upload Document
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
            <button className={`${styles.bottomNavItem} ${activeNav === 'dashboard' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('dashboard')}>
                <span className={styles.bottomNavIcon}>📊</span>
                <span className={styles.bottomNavLabel}>Dashboard</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'residents' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('residents')}>
                <span className={styles.bottomNavIcon}>👥</span>
                <span className={styles.bottomNavLabel}>Residents</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'payments' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('payments')}>
                <span className={styles.bottomNavIcon}>💳</span>
                <span className={styles.bottomNavLabel}>Payments</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'more' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('more')}>
                <span className={styles.bottomNavIcon}>⚙️</span>
                <span className={styles.bottomNavLabel}>More</span>
            </button>
        </nav>
      )}
      {isSubmitting && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Creating..." />
          </div>
        </div>
      )}
      <Popup 
        isOpen={popupConfig.isOpen}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
      />
    </div>
  );
}
