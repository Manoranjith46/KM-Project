import { useState, useEffect } from "react";
import styles from "./AD_Settings.module.css";
import Sidebar from "./Components/Sidebar/Sidebar";

const SETTING_TABS = [
  { id: "profile",       label: "My Profile" },
  { id: "property",      label: "Property Details" },
  { id: "notifications", label: "Notifications" },
  { id: "security",      label: "Security" },
  { id: "billing",       label: "Billing" },
];

export default function Admin_Settings() {
  const [activeNav, setActiveNav]     = useState("settings");
  const [activeTab, setActiveTab]     = useState("profile");
  const [creditCards, setCreditCards] = useState(true);
  const [isMobile, setIsMobile]       = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ── Property form ── */
  const [form, setForm] = useState({
    propertyName:  "PG-Ease",
    address:       "42, Lakeview Colony, Hyderabad, Telangana – 500081",
    totalBeds:     "50",
    contactNumber: "+91 98765 43210",
    managerEmail:  "admin@pgease.in",
    upiId:         "pgease@upi",
  });
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── Profile form ── */
  const [profile, setProfile] = useState({
    fullName:  "Admin Kumar",
    email:     "admin@pgease.in",
    phone:     "+91 98765 43210",
    role:      "Owner / Admin",
    bio:       "Managing PG-Ease since 2022. Passionate about comfortable living spaces.",
  });
  const handleProfile = (e) =>
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── Notifications toggles ── */
  const [notifs, setNotifs] = useState({
    rentReminders:   true,
    paymentAlerts:   true,
    maintenanceAlerts: true,
    mealFeedback:    false,
    newResidents:    true,
    weeklyReport:    false,
    smsAlerts:       true,
    emailDigest:     true,
  });
  const toggleNotif = (key) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── Security form ── */
  const [secForm, setSecForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [twoFa, setTwoFa] = useState(true);
  const handleSec = (e) =>
    setSecForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── Billing ── */
  const INVOICES = [
    { id: "INV-2026-02", plan: "Pro Plan", amount: "₹2,499", date: "01 Feb 2026", status: "Paid" },
    { id: "INV-2026-01", plan: "Pro Plan", amount: "₹2,499", date: "01 Jan 2026", status: "Paid" },
    { id: "INV-2025-12", plan: "Pro Plan", amount: "₹2,499", date: "01 Dec 2025", status: "Paid" },
    { id: "INV-2025-11", plan: "Starter",  amount: "₹999",   date: "01 Nov 2025", status: "Paid" },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Floating Background Blobs ── */}
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* ── Desktop sidebar ── */}
      <Sidebar currentPath={'settings'} />

      {/* ── Main Content ── */}
      <main className={styles.mainContent}>

        {/* ── Top Nav ── */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>Settings &amp; Preferences</h1>
            </div>
          </div>

          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search settings..."
              aria-label="Search settings"
            />
          </div>

          <div className={styles.topNavRight}>
            <button className={styles.bellBtn} aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className={styles.bellDot} aria-hidden="true" />
            </button>
            <div className={styles.avatar} aria-label="Admin profile">A</div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className={styles.content}>
          
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>Admin Settings</h2>
          </div>

          {/* Settings container – split card */}
          <div className={styles.settingsCard}>

            {/* Inner sidebar – vertical tabs (desktop) / horizontal scroll (mobile) */}
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
              
              {/* ── PROPERTY DETAILS ── */}
              {activeTab === "property" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Property Details</h3>
                    <p className={styles.formSubtext}>Manage your PG's core information.</p>
                  </div>

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
                      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                        <div className={styles.toggleRow}>
                          <div>
                            <span className={styles.toggleRowLabel}>Accept Credit Cards</span>
                            <span className={styles.toggleRowSub}>Allow residents to pay via credit card</span>
                          </div>
                          <button role="switch" aria-checked={creditCards} className={`${styles.toggle} ${creditCards ? styles.toggleOn : ""}`} onClick={() => setCreditCards((v) => !v)}>
                            <span className={styles.toggleThumb} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formFooter}>
                    <hr className={styles.divider} />
                    <div className={styles.footerActions}>
                      <button className={styles.cancelBtn}>Cancel</button>
                      <button className={styles.saveBtn}>Save Changes</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MY PROFILE ── */}
              {activeTab === "profile" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>My Profile</h3>
                    <p className={styles.formSubtext}>Update your personal information and display preferences.</p>
                  </div>

                  <div className={styles.avatarRow}>
                    <div className={styles.profileAvatar}>AK</div>
                    <div className={styles.avatarMeta}>
                      <span className={styles.avatarName}>{profile.fullName}</span>
                      <span className={styles.avatarRole}>{profile.role}</span>
                    </div>
                    <button className={styles.outlineBtn}>Change Photo</button>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="fullName">Full Name</label>
                      <input id="fullName" name="fullName" className={styles.input} value={profile.fullName} onChange={handleProfile} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="role">Role</label>
                      <input id="role" name="role" className={styles.input} value={profile.role} onChange={handleProfile} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="profileEmail">Email Address</label>
                      <input id="profileEmail" name="email" type="email" className={styles.input} value={profile.email} onChange={handleProfile} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="profilePhone">Phone Number</label>
                      <input id="profilePhone" name="phone" className={styles.input} value={profile.phone} onChange={handleProfile} />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                      <label className={styles.label} htmlFor="bio">Short Bio</label>
                      <textarea id="bio" name="bio" className={`${styles.input} ${styles.textarea}`} rows={3} value={profile.bio} onChange={handleProfile} />
                    </div>
                  </div>

                  <div className={styles.formFooter}>
                    <hr className={styles.divider} />
                    <div className={styles.footerActions}>
                      <button className={styles.cancelBtn}>Cancel</button>
                      <button className={styles.saveBtn}>Save Profile</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "notifications" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Notifications</h3>
                    <p className={styles.formSubtext}>Choose which alerts and digests you receive.</p>
                  </div>

                  {[
                    {
                      group: "In-App Alerts",
                      items: [
                        { key: "rentReminders",   label: "Rent Reminders",     sub: "Notify 3 days before rent is due" },
                        { key: "paymentAlerts",   label: "Payment Received",   sub: "Instant alert on every payment" },
                        { key: "maintenanceAlerts",label: "Maintenance Tickets",sub: "New and updated complaint tickets" },
                        { key: "mealFeedback",    label: "Meal Feedback",      sub: "Resident ratings after each service" },
                        { key: "newResidents",    label: "New Resident Check-in",sub: "Alert when a new resident is added" },
                      ],
                    },
                    {
                      group: "External Channels",
                      items: [
                        { key: "weeklyReport", label: "Weekly Summary Report", sub: "Email digest every Monday morning" },
                        { key: "smsAlerts",    label: "SMS Alerts",           sub: "Critical alerts via SMS" },
                        { key: "emailDigest",  label: "Daily Email Digest",    sub: "End-of-day activity summary" },
                      ],
                    },
                  ].map(({ group, items }) => (
                    <div key={group} className={styles.subSection}>
                      <h4 className={styles.subSectionTitle}>{group}</h4>
                      {items.map(({ key, label, sub }) => (
                        <div key={key} className={styles.toggleRow}>
                          <div>
                            <span className={styles.toggleRowLabel}>{label}</span>
                            <span className={styles.toggleRowSub}>{sub}</span>
                          </div>
                          <button role="switch" aria-checked={notifs[key]} className={`${styles.toggle} ${notifs[key] ? styles.toggleOn : ""}`} onClick={() => toggleNotif(key)}>
                            <span className={styles.toggleThumb} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className={styles.formFooter}>
                    <hr className={styles.divider} />
                    <div className={styles.footerActions}>
                      <button className={styles.cancelBtn}>Reset</button>
                      <button className={styles.saveBtn}>Save Preferences</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
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
                        <input id="newPassword" name="newPassword" type="password" className={styles.input} placeholder="Min. 8 characters" value={secForm.newPassword} onChange={handleSec} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                        <input id="confirmPassword" name="confirmPassword" type="password" className={styles.input} placeholder="Repeat new password" value={secForm.confirmPassword} onChange={handleSec} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.subSection}>
                    <h4 className={styles.subSectionTitle}>Two-Factor Authentication</h4>
                    <div className={styles.toggleRow}>
                      <div>
                        <span className={styles.toggleRowLabel}>Enable 2FA via OTP</span>
                        <span className={styles.toggleRowSub}>Require OTP on every login for added security</span>
                      </div>
                      <button role="switch" aria-checked={twoFa} className={`${styles.toggle} ${twoFa ? styles.toggleOn : ""}`} onClick={() => setTwoFa((v) => !v)}>
                        <span className={styles.toggleThumb} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.formFooter}>
                    <hr className={styles.divider} />
                    <div className={styles.footerActions}>
                      <button className={styles.cancelBtn}>Cancel</button>
                      <button className={styles.saveBtn}>Update Security</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── BILLING ── */}
              {activeTab === "billing" && (
                <div className={styles.tabContentFade}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Billing</h3>
                    <p className={styles.formSubtext}>Your current plan, payment method, and invoice history.</p>
                  </div>

                  <div className={styles.planCard}>
                    <div className={styles.planInfo}>
                      <span className={styles.planBadge}>Active</span>
                      <span className={styles.planName}>Pro Plan</span>
                      <span className={styles.planPrice}>₹2,499 <small>/month</small></span>
                      <span className={styles.planRenews}>Renews on 01 Mar 2026</span>
                    </div>
                    <button className={styles.outlineBtn}>Upgrade Plan</button>
                  </div>

                  <div className={styles.subSection}>
                    <h4 className={styles.subSectionTitle}>Invoice History</h4>
                    <div className={styles.invoiceTable}>
                      <div className={styles.invoiceHead}>
                        <span>Invoice</span>
                        <span>Plan</span>
                        <span>Amount</span>
                        <span>Date</span>
                        <span>Status</span>
                      </div>
                      {INVOICES.map((inv) => (
                        <div key={inv.id} className={styles.invoiceRow}>
                          <span className={styles.invoiceId}>{inv.id}</span>
                          <span>{inv.plan}</span>
                          <span>{inv.amount}</span>
                          <span>{inv.date}</span>
                          <span className={styles.pillPaid}>Paid</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* ── Bottom Nav (Mobile Only) ── */}
      {isMobile && (
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
            <button className={`${styles.bottomNavItem} ${activeNav === 'dashboard' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('dashboard')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Dashboard</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'residents' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('residents')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Residents</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'payments' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('payments')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Payments</span>
            </button>
            <button className={`${styles.bottomNavItem} ${activeNav === 'settings' ? styles.bottomNavItemActive : ""}`} onClick={() => setActiveNav('settings')}>
                <span className={styles.bottomNavIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </span>
                <span className={styles.bottomNavLabel}>Settings</span>
            </button>
        </nav>
      )}
    </div>
  );
}