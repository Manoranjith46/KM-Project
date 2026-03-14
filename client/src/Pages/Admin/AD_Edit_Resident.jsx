import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../API/axios";
import styles from "./AD_Edit_Resident.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import { EditResidentSkeleton } from "./Components/Skeleton/Skeleton";
import Loader from "../Resident/Components/Loader/Loader";
import { minDelay } from "../../utils/minDelay";
import useBlockInteraction from "../../hooks/useBlockInteraction";
import { validators } from "../../utils/validators";
import { FormFieldError } from "../../Components/FormError";

const toInputDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeResident = (data) => {
  if (!data || typeof data !== "object") return null;

  return {
    name: data.name || "",
    phoneNumber: data.phoneNumber || data.phone || "",
    roomNumber: data.roomNumber || data.roomNo || "",
    joiningDate: toInputDate(data.joiningDate),
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    guardianDetails: {
      name: data.guardianDetails?.name || data.guardianName || "",
      phone: data.guardianDetails?.phone || data.guardianPhone || "",
    },
  };
};

export default function Admin_EditResident() {
  const { phone } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    roomNumber: "",
    joiningDate: "",
    isActive: true,
    guardianName: "",
    guardianPhone: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const inputRefs = useRef({});

  const [originalPhone, setOriginalPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useBlockInteraction(saving);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validationRules = {
    name: (value) => validators.name(value, 'Full name'),
    phoneNumber: (value) => validators.phone(value, true),
    roomNumber: (value) => validators.required(value, 'Room number'),
    guardianName: (value) => validators.name(value, 'Guardian name'),
    guardianPhone: (value) => validators.phone(value, true),
  };

  const validateField = (name, value) => {
    if (validationRules[name]) {
      return validationRules[name](value);
    }
    return '';
  };

  const focusField = (fieldName) => () => {
    if (inputRefs.current[fieldName]) {
      inputRefs.current[fieldName].focus();
      inputRefs.current[fieldName].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const validateAll = () => {
    const errors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, form[field]);
      if (error) errors[field] = error;
    });
    setFieldErrors(errors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && inputRefs.current[firstErrorField]) {
      inputRefs.current[firstErrorField].focus();
    }
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchResident = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/residents/${encodeURIComponent(phone)}`);
        const resident = normalizeResident(response.data);

        if (!resident) {
          setError("Resident not found.");
          return;
        }

        setOriginalPhone(resident.phoneNumber || phone || "");
        setForm({
          name: resident.name,
          phoneNumber: resident.phoneNumber,
          roomNumber: resident.roomNumber,
          joiningDate: resident.joiningDate,
          isActive: resident.isActive,
          guardianName: resident.guardianDetails.name,
          guardianPhone: resident.guardianDetails.phone,
        });
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load resident details.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (phone) {
      fetchResident();
    } else {
      setError("No resident phone number provided.");
      setLoading(false);
    }
  }, [phone]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let processedValue = value;

    // Handle phone number fields - only digits, max 10
    if (name === 'phoneNumber' || name === 'guardianPhone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setForm((previous) => ({ ...previous, [name]: processedValue }));
    setError('');

    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, processedValue) }));
    }
  };

  const handleBlur = (fieldName) => () => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setFieldErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, form[fieldName]) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateAll()) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        roomNumber: form.roomNumber.trim().toUpperCase(),
        joiningDate: form.joiningDate || undefined,
        isActive: form.isActive,
        guardianDetails: {
          name: form.guardianName.trim(),
          phone: form.guardianPhone.trim(),
        },
      };

      await minDelay(API.put(`/residents/${encodeURIComponent(originalPhone || phone)}`, payload));
      setSuccess("Resident details updated successfully.");

      const nextPhone = payload.phoneNumber || originalPhone || phone;
      setTimeout(() => {
        navigate(`/admin/residents/view/${encodeURIComponent(nextPhone)}`);
      }, 600);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update resident details.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath={"residents"} />

      <main className={styles.mainContent}>
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              Back to Profile
            </button>
            <h2 className={styles.sectionTitle}>Edit Resident Details</h2>
          </div>

          {loading ? <EditResidentSkeleton /> : null}

          {!loading ? (
            <form className={styles.formCard} onSubmit={handleSubmit}>
              {error ? <div className={styles.errorMessage}>{error}</div> : null}
              {success ? <div className={styles.successMessage}>{success}</div> : null}

              <div className={styles.grid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="name">Full Name</label>
                  <input
                    ref={(el) => inputRefs.current.name = el}
                    id="name"
                    name="name"
                    className={`${styles.input} ${touched.name && fieldErrors.name ? 'input-error' : ''}`}
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur('name')}
                  />
                  <FormFieldError error={touched.name && fieldErrors.name} onFocus={focusField('name')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="phoneNumber">Phone Number</label>
                  <input
                    ref={(el) => inputRefs.current.phoneNumber = el}
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    className={`${styles.input} ${touched.phoneNumber && fieldErrors.phoneNumber ? 'input-error' : ''}`}
                    value={form.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur('phoneNumber')}
                    placeholder="9876543210"
                  />
                  <FormFieldError error={touched.phoneNumber && fieldErrors.phoneNumber} onFocus={focusField('phoneNumber')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="roomNumber">Room Number</label>
                  <input
                    ref={(el) => inputRefs.current.roomNumber = el}
                    id="roomNumber"
                    name="roomNumber"
                    className={`${styles.input} ${touched.roomNumber && fieldErrors.roomNumber ? 'input-error' : ''}`}
                    value={form.roomNumber}
                    onChange={handleChange}
                    onBlur={handleBlur('roomNumber')}
                  />
                  <FormFieldError error={touched.roomNumber && fieldErrors.roomNumber} onFocus={focusField('roomNumber')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="joiningDate">Joining Date</label>
                  <input id="joiningDate" name="joiningDate" type="date" className={styles.input} value={form.joiningDate} onChange={handleChange} />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="guardianName">Guardian Name</label>
                  <input
                    ref={(el) => inputRefs.current.guardianName = el}
                    id="guardianName"
                    name="guardianName"
                    className={`${styles.input} ${touched.guardianName && fieldErrors.guardianName ? 'input-error' : ''}`}
                    value={form.guardianName}
                    onChange={handleChange}
                    onBlur={handleBlur('guardianName')}
                  />
                  <FormFieldError error={touched.guardianName && fieldErrors.guardianName} onFocus={focusField('guardianName')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="guardianPhone">Guardian Phone</label>
                  <input
                    ref={(el) => inputRefs.current.guardianPhone = el}
                    id="guardianPhone"
                    name="guardianPhone"
                    type="tel"
                    className={`${styles.input} ${touched.guardianPhone && fieldErrors.guardianPhone ? 'input-error' : ''}`}
                    value={form.guardianPhone}
                    onChange={handleChange}
                    onBlur={handleBlur('guardianPhone')}
                    placeholder="9876543210"
                  />
                  <FormFieldError error={touched.guardianPhone && fieldErrors.guardianPhone} onFocus={focusField('guardianPhone')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="isActive">Status</label>
                  <select
                    id="isActive"
                    name="isActive"
                    className={styles.input}
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(event) => {
                      const selected = event.target.value === "active";
                      setForm((previous) => ({ ...previous, isActive: selected }));
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button type="button" className={styles.secondaryBtn} onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </main>

      {saving && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text="Updating..." />
          </div>
        </div>
      )}
    </div>
  );
}
