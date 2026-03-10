import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./AD_View_Resident.module.css";
import Popup from "./Components/Popup/Popup";
import { ViewResidentSkeleton } from "./Components/Skeleton/Skeleton";

export default function Admin_View_Resident() {
  // useParams grabs the ID from the URL (e.g., /admin/residents/:phone)
  const { phone } = useParams(); 
  const navigate = useNavigate();

  const [resident, setResident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
  });

  const normalizeResident = (data) => {
    if (!data || typeof data !== "object") return null;

    const fullName = (data.name || `${data.firstName || ""} ${data.lastName || ""}`).trim();
    const [firstFromName = "", ...restName] = fullName.split(" ").filter(Boolean);

    return {
      ...data,
      firstName: data.firstName || firstFromName,
      lastName: data.lastName || restName.join(" "),
      displayName: fullName,
      roomNo: data.roomNo || data.roomNumber || "N/A",
      phone: data.phone || data.phoneNumber || "N/A",
      joiningDate: data.joiningDate || null,
      status: data.status || (data.isActive === false ? "Inactive" : "Active"),
      documentImage: data.documentImage || data.document || data.aadharUrl || null,
      guardianName: data.guardianName || data.guardianDetails?.name || "N/A",
      guardianPhone: data.guardianPhone || data.guardianDetails?.phone || "N/A",
    };
  };

  useEffect(() => {
    const fetchResidentDetails = async () => {
      try {
        // Fetch specific resident by phone number
        const response = await fetch(`${import.meta.env.VITE_API_URL}api/residents/${encodeURIComponent(phone)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // CRITICAL: Include HttpOnly JWT cookie
        });

        // Handle authentication/authorization errors
        if (response.status === 401) {
          setError("Unauthorized: Please log in again.");
          setIsLoading(false);
          return;
        }

        if (response.status === 403) {
          setError("Forbidden: Only owners can view resident details.");
          setIsLoading(false);
          return;
        }

        // Handle not found
        if (response.status === 404) {
          setError("Resident not found.");
          setIsLoading(false);
          return;
        }

        // Handle other errors
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setResident(normalizeResident(data));
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load resident details: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (phone) {
      fetchResidentDetails();
    } else {
      setError('No phone number provided');
      setIsLoading(false);
    }
  }, [phone]);

  const handleDischargeResident = async () => {
    if (!phone || isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/residents/${encodeURIComponent(phone)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to discharge resident (${response.status})`);
      }

      navigate("/admin/residents");
    } catch (err) {
      setPopupConfig({
        isOpen: true,
        type: "error",
        title: "Discharge Failed",
        message: err.message || "Failed to discharge resident.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDischargeConfirmPopup = () => {
    if (!phone || isDeleting) return;
    setPopupConfig({
      isOpen: true,
      type: "confirm",
      title: "Discharge Resident?",
      message: "This will remove the resident from active list and save their history.",
    });
  };

  if (error) return <div className={styles.errorMessage}>{error}</div>;
  if (!isLoading && !resident) return <div className={styles.errorMessage}>Resident not found.</div>;

  return (
    <div className={styles.pageContainer}>
      
      {/* Header Section */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Directory
        </button>
        <h1 className={styles.pageTitle}>Resident Profile</h1>
      </div>

      {isLoading ? <ViewResidentSkeleton /> : (
      <div className={styles.gridContainer}>
        
        {/* Left Card: Basic Information */}
        <div className={styles.glassCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {/* Display initials */}
              {(resident.firstName || resident.displayName)?.charAt(0)}{resident.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className={styles.name}>{resident.displayName || `${resident.firstName} ${resident.lastName}`.trim() || "N/A"}</h2>
              <span className={styles.roomBadge}>Room {resident.roomNo}</span>
            </div>
          </div>

          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Phone Number</span>
              <span className={styles.value}>{resident.phone || "N/A"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Date of Birth</span>
              <span className={styles.value}>
                {resident.dob ? new Date(resident.dob).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Blood Group</span>
              <span className={styles.value}>{resident.bloodGroup || "N/A"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Guardian Name</span>
              <span className={styles.value}>{resident.guardianName || "N/A"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Guardian Phone</span>
              <span className={styles.value}>{resident.guardianPhone || "N/A"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Monthly Rent</span>
              <span className={styles.value}>₹{resident.monthlyRent ?? "N/A"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Security Deposit</span>
              <span className={styles.value}>₹{resident.securityDeposit ?? "N/A"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Joining Date</span>
              <span className={styles.value}>
                {resident.joiningDate ? new Date(resident.joiningDate).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Status</span>
              <span className={`${styles.statusBadge} ${resident.status === 'Active' ? styles.statusActive : styles.statusNotice}`}>
                {resident.status || "Active"}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            {/* Placeholders for future features */}
            <button className={styles.editBtn} onClick={() => navigate(`/admin/resident/edit/${phone}`)}>Edit Details</button>
            <button className={styles.deleteBtn} onClick={openDischargeConfirmPopup} disabled={isDeleting}>
              {isDeleting ? "Discharging..." : "Discharge Resident"}
            </button>
          </div>
        </div>

        {/* Right Card: Identity Document */}
        <div className={styles.glassCard}>
          <h3 className={styles.sectionTitle}>Identity Document</h3>
          
          <div className={styles.documentViewer}>
            {resident.documentImage ? (
              <img 
                src={
                  resident.documentImage.startsWith('data:')
                    ? resident.documentImage
                    : `${import.meta.env.VITE_API_URL}api/uploads/${resident.documentImage}`
                }
                alt={`${resident.displayName || resident.firstName || "Resident"}'s Document`} 
                className={styles.documentImage} 
              />
            ) : (
              <div className={styles.noDocument}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <p>No document uploaded</p>
              </div>
            )}
          </div>
        </div>

      </div>
      )}

      <Popup
        isOpen={popupConfig.isOpen}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onConfirm={handleDischargeResident}
        confirmText="Discharge"
        cancelText="Cancel"
        onClose={() => setPopupConfig({ isOpen: false, type: "", title: "", message: "" })}
      />
    </div>
  );
}
