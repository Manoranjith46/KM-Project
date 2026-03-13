import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../API/axios";
import { useAuth } from "../../Context/AuthContext";
import useSocket from "../../hooks/useSocket";
import { NoticeSkeleton } from "./Components/Skeleton/Skeleton";
import Popup from './Components/popup/Popup';
import styles from "./RD_Notice_Board.module.css";

export default function Resident_NoticeBoard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isGuest = user?.role === 'guest';
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const [Announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useSocket(user?.mobileNumber);
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });

  const sortedNotices = [...Announcements].sort((a, b) => {
    const aIsUrgent = a.type === "urgent";
    const bIsUrgent = b.type === "urgent";

    if (aIsUrgent === bIsUrgent) return 0;
    return aIsUrgent ? -1 : 1;
  });

// API Call for Fetching Announcements from Backend

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await API.get("/residents/announcements");
      setAnnouncements(response?.data || []);
    } catch (error) {
      console.error('Error fetching announcement history:', error);
      setAnnouncements([]);
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Load Failed',
        message: error.response?.data?.message || 'Could not fetch announcements right now.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onUpdated = () => fetchAnnouncements();
    socket.on('announcements:updated', onUpdated);

    return () => socket.off('announcements:updated', onUpdated);
  }, [socketRef, fetchAnnouncements]);

  

  return (
    <div className={`${styles.pageWrapper} ${isGuest ? styles.pageWrapperGuest : ''}`}>

      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest1 : styles.blob1}`}></div>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest2 : styles.blob2}`}></div>
        <div className={`${styles.blob} ${isGuest ? styles.blobGuest3 : styles.blob3}`}></div>
      </div>

      <div className={styles.container}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <button className={`${styles.backBtn} ${isGuest ? styles.backBtnGuest : ''}`} onClick={() => navigate('/resident/dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <button className={styles.mobileLogoutBtn} onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? '...' : 'Logout'}
            </button>
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Announcement Board</h1>
            <p className={styles.subTitle}>Important updates and hostel rules</p>
          </div>
        </header>

        {/* Announcements LIST */}
        {isLoading ? <NoticeSkeleton isGuest={isGuest} /> : (
        <div className={`${styles.noticeList} ${Announcements.length === 0 ? styles.noticeListEmpty : ""}`}>
          {Announcements.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.noticeMessage}>No announcements.</p>
            </div>
          ) : (
            sortedNotices.map((Announcement) => (
              <div 
                key={Announcement._id || Announcement.id} 
                className={`${styles.glassCard} ${styles.urgentCard}`}
              >
                <div className={styles.cardTop}>
                  <div className={`${styles.iconWrapper} ${isGuest ? styles.iconWrapperGuest : ''}`}>{Announcement.icon}</div>
                  <div className={styles.titleArea}>
                    <h2 className={styles.noticeTitle}>{Announcement.title}</h2>
                    <span className={styles.noticeDate}>
                      {Announcement.date || (Announcement.createdAt ? new Date(Announcement.createdAt).toLocaleDateString() : "")}
                    </span>
                  </div>
                  {Announcement.type === 'urgent' && (
                    <span className={styles.urgentBadge}>Important</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.noticeMessage}>{Announcement.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
        )}

      </div>

      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        type={popup.type}
        title={popup.title}
        message={popup.message}
      />
    </div>
  );
}