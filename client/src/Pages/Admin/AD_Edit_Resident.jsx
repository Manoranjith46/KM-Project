import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../API/axios";
import styles from "./AD_Edit_Resident.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import { EditResidentSkeleton } from "./Components/Skeleton/Skeleton";
import Loader from "../Resident/Components/Loader/Loader";

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

  const [originalPhone, setOriginalPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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

      await API.put(`/residents/${encodeURIComponent(originalPhone || phone)}`, payload);
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
                  <input id="name" name="name" className={styles.input} value={form.name} onChange={handleChange} required />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="phoneNumber">Phone Number</label>
                  <input id="phoneNumber" name="phoneNumber" className={styles.input} value={form.phoneNumber} onChange={handleChange} required />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="roomNumber">Room Number</label>
                  <input id="roomNumber" name="roomNumber" className={styles.input} value={form.roomNumber} onChange={handleChange} required />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="joiningDate">Joining Date</label>
                  <input id="joiningDate" name="joiningDate" type="date" className={styles.input} value={form.joiningDate} onChange={handleChange} />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="guardianName">Guardian Name</label>
                  <input id="guardianName" name="guardianName" className={styles.input} value={form.guardianName} onChange={handleChange} required />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="guardianPhone">Guardian Phone</label>
                  <input id="guardianPhone" name="guardianPhone" className={styles.input} value={form.guardianPhone} onChange={handleChange} required />
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
