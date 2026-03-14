import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../API/axios";
import { minDelay } from "../../utils/minDelay";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../Components/ImageCrop";
import Loader from "../Resident/Components/Loader/Loader";
import Popup from "./Components/Popup/Popup";
import { SettingsProfileSkeleton, SettingsPropertySkeleton, SettingsRoomsSkeleton } from "./Components/Skeleton/Skeleton";
import styles from "./AD_Settings.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";
import useBlockInteraction from "../../hooks/useBlockInteraction";

const SETTING_TABS = [
  { id: "profile",  label: "My Profile" },
  { id: "property", label: "Property Details" },
  { id: "rooms",    label: "Rooms & Rates" },
  { id: "security", label: "Security" },
];

export default function Admin_Settings() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const fileInputRef = useRef(null);

  // Profile photo
  const [profilePhoto, setProfilePhoto] = useState("");

  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempPreviewUrl, setTempPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Skeleton / initial loading
  const [loadingProfile, setLoadingProfile]   = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(true);

  // Loader & Popup state
  const [loaderText, setLoaderText] = useState("");
  useBlockInteraction(loaderText);
  const [popup, setPopup] = useState({ isOpen: false, type: "info", title: "", message: "" });

  // Scroll lock when overlay is open
  useEffect(() => {
    const hasOverlay = Boolean(loaderText || popup.isOpen || showCropModal);
    document.body.style.overflow = hasOverlay ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [loaderText, popup.isOpen, showCropModal]);

  // Profile form
  const [profile, setProfile] = useState({ name: "", email: "", mobileNumber: "", role: "" });
  const [profileOriginal, setProfileOriginal] = useState(null);
  const handleProfile = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Property form
  const [form, setForm] = useState({ propertyName: "", address: "", totalBeds: "", contactNumber: "", managerEmail: "", upiId: "" });
  const [formOriginal, setFormOriginal] = useState(null);
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Security form
  const [secForm, setSecForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const handleSec = (e) => setSecForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Rooms & Rates
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [ratesForm, setRatesForm] = useState({ monthly: "", daily: "" });
  const [ratesOriginal, setRatesOriginal] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomsOriginal, setRoomsOriginal] = useState([]);


  // Fetch profile on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await minDelay(API.get("/admin/settings/profile"));
        const p = { name: data.name, email: data.email, mobileNumber: data.mobileNumber, role: data.role };
        setProfile(p);
        setProfileOriginal(p);
        if (data.profilePhoto) setProfilePhoto(data.profilePhoto);
      } catch {
        // AuthContext data fallback
        if (user) {
          const p = { name: user.name || "", email: user.email || "", mobileNumber: user.mobileNumber || "", role: user.role || "" };
          setProfile(p);
          setProfileOriginal(p);
        }
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch property on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await minDelay(API.get("/admin/settings/property"));
        const f = {
          propertyName: data.propertyName || "",
          address: data.address || "",
          totalBeds: data.totalBeds ? String(data.totalBeds) : "",
          contactNumber: data.contactNumber || "",
          managerEmail: data.managerEmail || "",
          upiId: data.upiId || "",
        };
        setForm(f);
        setFormOriginal(f);
      } catch {
        // leave empty defaults
      } finally {
        setLoadingProperty(false);
      }
    })();
  }, []);

  // Fetch rooms & rates on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await minDelay(API.get("/admin/settings/rooms-rates"));
        const r = { monthly: data.monthly || "", daily: data.daily || "" };
        setRatesForm(r);
        setRatesOriginal(r);
        setRooms(data.rooms || []);
        setRoomsOriginal(data.rooms || []);
      } catch {
        // leave defaults
      } finally {
        setLoadingRooms(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  // ── Save profile ──
  const saveProfile = async () => {
    if (!profile.name.trim() || !profile.mobileNumber.trim()) {
      setPopup({ isOpen: true, type: "warning", title: "Missing Fields", message: "Name and mobile number are required." });
      return;
    }
    setLoaderText("Saving");
    try {
      const { data } = await minDelay(API.put("/admin/settings/profile", {
        name: profile.name.trim(),
        email: profile.email.trim(),
        mobileNumber: profile.mobileNumber.trim(),
      }));
      setLoaderText("");
      // Update AuthContext + sessionStorage
      login(data.user);
      const p = { name: data.user.name, email: data.user.email, mobileNumber: data.user.mobileNumber, role: data.user.role };
      setProfile(p);
      setProfileOriginal(p);
      setPopup({ isOpen: true, type: "success", title: "Profile Updated", message: "Your profile has been updated successfully." });
    } catch (err) {
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Update Failed", message: err.response?.data?.message || "Could not update profile." });
    }
  };

  // ── Save property ──
  const saveProperty = async () => {
    setLoaderText("Saving");
    try {
      const { data } = await minDelay(API.put("/admin/settings/property", {
        propertyName: form.propertyName.trim(),
        address: form.address.trim(),
        totalBeds: form.totalBeds ? Number(form.totalBeds) : 0,
        contactNumber: form.contactNumber.trim(),
        managerEmail: form.managerEmail.trim(),
        upiId: form.upiId.trim(),
      }));
      setLoaderText("");
      const f = {
        propertyName: data.property.propertyName || "",
        address: data.property.address || "",
        totalBeds: data.property.totalBeds ? String(data.property.totalBeds) : "",
        contactNumber: data.property.contactNumber || "",
        managerEmail: data.property.managerEmail || "",
        upiId: data.property.upiId || "",
      };
      setForm(f);
      setFormOriginal(f);
      setPopup({ isOpen: true, type: "success", title: "Property Updated", message: "Property details saved successfully." });
    } catch (err) {
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Update Failed", message: err.response?.data?.message || "Could not update property details." });
    }
  };

  // ── Save rooms & rates ──
  const saveRoomsAndRates = async () => {
    if (!ratesForm.monthly || !ratesForm.daily) {
      setPopup({ isOpen: true, type: "warning", title: "Missing Fields", message: "Monthly and daily rent rates are required." });
      return;
    }
    // Validate rooms
    for (const room of rooms) {
      if (!room.roomNo.trim()) {
        setPopup({ isOpen: true, type: "warning", title: "Invalid Room", message: "Room number cannot be empty." });
        return;
      }
      if (!room.beds || room.beds < 1) {
        setPopup({ isOpen: true, type: "warning", title: "Invalid Beds", message: `Room ${room.roomNo} must have at least 1 bed.` });
        return;
      }
    }
    setLoaderText("Saving");
    try {
      const { data } = await minDelay(API.put("/admin/settings/rooms-rates", {
        monthly: ratesForm.monthly,
        daily: ratesForm.daily,
        rooms: rooms.map(r => ({ roomNo: r.roomNo, beds: Number(r.beds), maxOccupants: Number(r.maxOccupants) })),
      }));
      setLoaderText("");
      const r = { monthly: data.monthly || "", daily: data.daily || "" };
      setRatesForm(r);
      setRatesOriginal(r);
      setRooms(data.rooms || []);
      setRoomsOriginal(data.rooms || []);
      setPopup({ isOpen: true, type: "success", title: "Saved", message: "Rooms & rates updated successfully." });
    } catch (err) {
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Update Failed", message: err.response?.data?.message || "Could not update rooms & rates." });
    }
  };

  // Room helpers
  const addRoom = () => setRooms([...rooms, { roomNo: "", beds: 1, maxOccupants: 1 }]);
  const removeRoom = (idx) => setRooms(rooms.filter((_, i) => i !== idx));
  const updateRoom = (idx, field, value) => {
    const updated = [...rooms];
    updated[idx] = { ...updated[idx], [field]: value };
    setRooms(updated);
  };
  const cancelRooms = () => {
    if (ratesOriginal) setRatesForm(ratesOriginal);
    setRooms(roomsOriginal.map(r => ({ ...r })));
  };

  // ── Change password ──
  const savePassword = async () => {
    if (!secForm.currentPassword || !secForm.newPassword || !secForm.confirmPassword) {
      setPopup({ isOpen: true, type: "warning", title: "Missing Fields", message: "Please fill in all password fields." });
      return;
    }
    if (secForm.newPassword.length < 6) {
      setPopup({ isOpen: true, type: "warning", title: "Weak Password", message: "New password must be at least 6 characters." });
      return;
    }
    if (secForm.newPassword !== secForm.confirmPassword) {
      setPopup({ isOpen: true, type: "warning", title: "Mismatch", message: "New password and confirm password do not match." });
      return;
    }
    setLoaderText("Updating");
    try {
      await minDelay(API.post("/admin/settings/change-password", {
        currentPassword: secForm.currentPassword,
        newPassword: secForm.newPassword,
      }));
      setLoaderText("");
      setSecForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPopup({ isOpen: true, type: "success", title: "Password Changed", message: "Your password has been updated successfully." });
    } catch (err) {
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Change Failed", message: err.response?.data?.message || "Could not change password." });
    }
  };

  // ── Open file picker → crop modal ──
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPopup({ isOpen: true, type: "warning", title: "Invalid File", message: "Please select an image file (JPG, PNG, or SVG)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTempPreviewUrl(ev.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Crop & upload ──
  const handleCropUpload = async () => {
    if (!tempPreviewUrl || !croppedAreaPixels) return;
    try {
      const { file } = await getCroppedImg(tempPreviewUrl, croppedAreaPixels);
      setShowCropModal(false);
      setLoaderText("Uploading");
      const fd = new FormData();
      fd.append("profilePhoto", file);
      const { data } = await minDelay(API.post("/admin/settings/profile-photo", fd));
      setProfilePhoto(data.profilePhoto);
      setLoaderText("");
      setPopup({ isOpen: true, type: "success", title: "Photo Updated", message: "Profile photo has been updated." });
    } catch (err) {
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Upload Failed", message: err.response?.data?.message || "Could not upload photo." });
    }
  };

  const closeCropModal = () => {
    setShowCropModal(false);
    setTempPreviewUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // ── Remove profile photo ──
  const removePhoto = async () => {
    setLoaderText("Removing");
    try {
      await minDelay(API.delete("/admin/settings/profile-photo"));
      setProfilePhoto("");
      setLoaderText("");
      setPopup({ isOpen: true, type: "success", title: "Photo Removed", message: "Profile photo has been removed." });
    } catch (err) {
      setLoaderText("");
      setPopup({ isOpen: true, type: "error", title: "Remove Failed", message: err.response?.data?.message || "Could not remove photo." });
    }
  };

  // Cancel handlers – reset to last saved values
  const cancelProfile  = () => { if (profileOriginal) setProfile(profileOriginal); };
  const cancelProperty = () => { if (formOriginal) setForm(formOriginal); };
  const cancelSecurity = () => setSecForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <Sidebar currentPath={"settings"} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.mainContent}>
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>Admin Settings</h2>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          <div className={styles.settingsCard}>
            {/* Inner sidebar tabs */}
            <nav className={styles.innerSidebar} aria-label="Settings sections">
              {SETTING_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.settingTab} ${activeTab === tab.id ? styles.settingTabActive : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? "true" : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Form area */}
            <div className={styles.formArea}>

              {/* ═══════════ MY PROFILE ═══════════ */}
              {activeTab === "profile" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>My Profile</h3>
                    <p className={styles.formSubtext}>Update your personal information.</p>
                  </div>

                  {loadingProfile ? (
                    <SettingsProfileSkeleton />
                  ) : (
                    <>
                      <div className={styles.avatarRow}>
                        <div
                          className={styles.profileAvatar}
                          style={profilePhoto ? {
                            backgroundImage: `url(${API.defaults.baseURL}/uploads/${profilePhoto})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            color: "transparent",
                          } : {}}
                        >
                          {!profilePhoto && (profile.name ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "AD")}
                        </div>
                        <div className={styles.avatarMeta}>
                          <span className={styles.avatarName}>{profile.name}</span>
                          <span className={styles.avatarRole}>{profile.role}</span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/svg+xml"
                          style={{ display: "none" }}
                          onChange={handlePhotoSelect}
                        />
                        <div className={styles.avatarActions}>
                          <button className={styles.outlineBtn} onClick={() => fileInputRef.current?.click()}>Change Photo</button>
                          {profilePhoto && (
                            <button className={styles.removeBtnSmall} onClick={removePhoto}>Remove</button>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor="name">Full Name</label>
                          <input id="name" name="name" className={styles.input} value={profile.name} onChange={handleProfile} />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor="role">Role</label>
                          <input id="role" name="role" className={styles.input} value={profile.role} disabled />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor="profileEmail">Email Address</label>
                          <input id="profileEmail" name="email" type="email" className={styles.input} value={profile.email} onChange={handleProfile} />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor="profilePhone">Mobile Number</label>
                          <input id="profilePhone" name="mobileNumber" className={styles.input} value={profile.mobileNumber} onChange={handleProfile} />
                        </div>
                      </div>

                      <div className={styles.formFooter}>
                        <hr className={styles.divider} />
                        <div className={styles.footerActions}>
                          <button className={styles.cancelBtn} onClick={cancelProfile}>Cancel</button>
                          <button className={styles.saveBtn} onClick={saveProfile}>Save Profile</button>
                        </div>
                      </div>

                      <div className={styles.logoutSection}>
                        <hr className={styles.divider} />
                        <button
                          className={styles.logoutBtn}
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          style={{ opacity: isLoggingOut ? 0.6 : 1, cursor: isLoggingOut ? "not-allowed" : "pointer" }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══════════ PROPERTY DETAILS ═══════════ */}
              {activeTab === "property" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Property Details</h3>
                    <p className={styles.formSubtext}>Manage your PG's core information.</p>
                  </div>

                  {loadingProperty ? (
                    <SettingsPropertySkeleton />
                  ) : (
                    <>
                      <div className={styles.formGrid}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor="propertyName">Property Name</label>
                          <input id="propertyName" name="propertyName" className={styles.input} value={form.propertyName} onChange={handleChange} />
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                          <label className={styles.label} htmlFor="address">Address</label>
                          <input id="address" name="address" className={styles.input} value={form.address} onChange={handleChange} />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor="totalBeds">Total Beds Capacity</label>
                          <input id="totalBeds" name="totalBeds" type="number" className={styles.input} value={form.totalBeds} onChange={handleChange} />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor="contactNumber">Contact Number</label>
                          <input id="contactNumber" name="contactNumber" className={styles.input} value={form.contactNumber} onChange={handleChange} />
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                          <label className={styles.label} htmlFor="managerEmail">Manager Email</label>
                          <input id="managerEmail" name="managerEmail" type="email" className={styles.input} value={form.managerEmail} onChange={handleChange} />
                        </div>
                      </div>

                      {/* Payment Setup sub-section */}
                      <div className={styles.subSection}>
                        <h4 className={styles.subSectionTitle}>Payment Setup</h4>
                        <div className={styles.formGrid}>
                          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                            <label className={styles.label} htmlFor="upiId">Default UPI ID</label>
                            <input id="upiId" name="upiId" className={styles.input} value={form.upiId} onChange={handleChange} />
                          </div>
                        </div>
                      </div>

                      <div className={styles.formFooter}>
                        <hr className={styles.divider} />
                        <div className={styles.footerActions}>
                          <button className={styles.cancelBtn} onClick={cancelProperty}>Cancel</button>
                          <button className={styles.saveBtn} onClick={saveProperty}>Save Changes</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══════════ ROOMS & RATES ═══════════ */}
              {activeTab === "rooms" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Rooms & Rates</h3>
                    <p className={styles.formSubtext}>Manage room numbers, bed capacity, and default rent rates.</p>
                  </div>

                  {loadingRooms ? (
                    <SettingsRoomsSkeleton />
                  ) : (
                    <>
                      {/* Rent Rates */}
                      <div className={styles.subSection}>
                        <h4 className={styles.subSectionTitle}>Default Rent Rates</h4>
                        <div className={styles.formGrid}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="monthlyRent">Monthly Rent (₹)</label>
                            <input
                              id="monthlyRent"
                              type="number"
                              className={styles.input}
                              value={ratesForm.monthly}
                              onChange={(e) => setRatesForm((p) => ({ ...p, monthly: e.target.value }))}
                              placeholder="e.g. 5000"
                              min="0"
                            />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="dailyRent">Daily Rent (₹)</label>
                            <input
                              id="dailyRent"
                              type="number"
                              className={styles.input}
                              value={ratesForm.daily}
                              onChange={(e) => setRatesForm((p) => ({ ...p, daily: e.target.value }))}
                              placeholder="e.g. 250"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Rooms */}
                      <div className={styles.subSection}>
                        <div className={styles.subSectionHeader}>
                          <h4 className={styles.subSectionTitle}>Rooms</h4>
                          <button className={styles.addRoomBtn} type="button" onClick={addRoom}>+ Add Room</button>
                        </div>

                        {rooms.length === 0 ? (
                          <p className={styles.emptyRooms}>No rooms added yet. Click "+ Add Room" to begin.</p>
                        ) : (
                          <div className={styles.roomsList}>
                            {rooms.map((room, idx) => (
                              <div key={idx} className={styles.roomRow}>
                                <div className={styles.roomField}>
                                  <label className={styles.roomLabel}>Room No</label>
                                  <input
                                    className={styles.input}
                                    value={room.roomNo}
                                    onChange={(e) => updateRoom(idx, "roomNo", e.target.value)}
                                    placeholder="e.g. 101"
                                  />
                                </div>
                                <div className={styles.roomField}>
                                  <label className={styles.roomLabel}>No. of Beds</label>
                                  <input
                                    type="number"
                                    className={styles.input}
                                    value={room.beds}
                                    onChange={(e) => updateRoom(idx, "beds", e.target.value)}
                                    min="1"
                                    placeholder="1"
                                  />
                                </div>
                                <div className={styles.roomField}>
                                  <label className={styles.roomLabel}>Max Residents</label>
                                  <input
                                    type="number"
                                    className={styles.input}
                                    value={room.maxOccupants}
                                    onChange={(e) => updateRoom(idx, "maxOccupants", e.target.value)}
                                    min="1"
                                    placeholder="1"
                                  />
                                </div>
                                <button
                                  className={styles.removeRoomBtn}
                                  type="button"
                                  onClick={() => removeRoom(idx)}
                                  aria-label={`Remove room ${room.roomNo}`}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.formFooter}>
                        <hr className={styles.divider} />
                        <div className={styles.footerActions}>
                          <button className={styles.cancelBtn} onClick={cancelRooms}>Cancel</button>
                          <button className={styles.saveBtn} onClick={saveRoomsAndRates}>Save Changes</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══════════ SECURITY ═══════════ */}
              {activeTab === "security" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Security</h3>
                    <p className={styles.formSubtext}>Manage your password and account security settings.</p>
                  </div>

                  <div className={styles.subSection}>
                    <h4 className={styles.subSectionTitle}>Change Password</h4>
                    <div className={styles.formGrid}>
                      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                        <label className={styles.label} htmlFor="currentPassword">Current Password</label>
                        <input id="currentPassword" name="currentPassword" type="password" className={styles.input} placeholder="••••••••" value={secForm.currentPassword} onChange={handleSec} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="newPassword">New Password</label>
                        <input id="newPassword" name="newPassword" type="password" className={styles.input} placeholder="Min. 6 characters" value={secForm.newPassword} onChange={handleSec} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                        <input id="confirmPassword" name="confirmPassword" type="password" className={styles.input} placeholder="Repeat new password" value={secForm.confirmPassword} onChange={handleSec} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formFooter}>
                    <hr className={styles.divider} />
                    <div className={styles.footerActions}>
                      <button className={styles.cancelBtn} onClick={cancelSecurity}>Cancel</button>
                      <button className={styles.saveBtn} onClick={savePassword}>Update Password</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════ CROP MODAL ═══════════ */}
      {showCropModal && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModal}>
            <div className={styles.cropModalHeader}>
              <h2 className={styles.cropModalTitle}>Crop Profile Photo</h2>
              <button className={styles.cropModalCloseBtn} type="button" onClick={closeCropModal}>✕</button>
            </div>

            <div className={styles.cropperArea}>
              {tempPreviewUrl && (
                <Cropper
                  image={tempPreviewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            <div className={styles.cropZoomContainer}>
              <label className={styles.zoomLabel}>Zoom:</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className={styles.zoomSlider}
              />
            </div>

            <div className={styles.cropModalFooter}>
              <button className={styles.cropCancelBtn} type="button" onClick={closeCropModal}>Cancel</button>
              <button className={styles.cropUploadBtn} type="button" onClick={handleCropUpload}>Upload Photo</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ LOADER ═══════════ */}
      {loaderText && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderPopup}>
            <Loader text={loaderText} />
          </div>
        </div>
      )}

      {/* ═══════════ POPUP ═══════════ */}
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
