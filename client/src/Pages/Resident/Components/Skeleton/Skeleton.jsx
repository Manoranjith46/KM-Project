import styles from './Skeleton.module.css';

export function Skeleton({ width, height, radius, className = '', isGuest = false }) {
  return (
    <div
      className={`${isGuest ? styles.skeletonGuest : styles.skeleton} ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function SkeletonCard({ children, className = '', isGuest = false }) {
  return (
    <div className={`${styles.skeletonCard} ${isGuest ? styles.skeletonCardGuest : ''} ${className}`}>
      {children}
    </div>
  );
}

/* ── Dashboard Skeleton ── */
export function DashboardSkeleton({ isGuest = false }) {
  return (
    <>
      {/* Header */}
      <div className={`${styles.skeletonHeader} ${isGuest ? styles.skeletonHeaderGuest : ''}`}>
        <div>
          <Skeleton width="260px" height="28px" radius="8px" isGuest={isGuest} />
          <Skeleton width="180px" height="16px" radius="6px" isGuest={isGuest} />
        </div>
        <div className={styles.skeletonHeaderRight}>
          <Skeleton width="48px" height="48px" radius="50%" isGuest={isGuest} />
          <Skeleton width="100px" height="16px" radius="6px" isGuest={isGuest} />
          <Skeleton width="90px" height="40px" radius="12px" isGuest={isGuest} />
        </div>
      </div>

      {/* Grid */}
      <div className={styles.skeletonGrid3}>
        {/* Gate Status */}
        <SkeletonCard isGuest={isGuest}>
          <div className={styles.skeletonRow}>
            <Skeleton width="120px" height="18px" radius="6px" isGuest={isGuest} />
            <Skeleton width="80px" height="28px" radius="12px" isGuest={isGuest} />
          </div>
          <Skeleton width="200px" height="32px" radius="8px" isGuest={isGuest} />
          <Skeleton width="100%" height="48px" radius="14px" isGuest={isGuest} />
        </SkeletonCard>

        {/* Total Spendings */}
        <SkeletonCard isGuest={isGuest}>
          <div className={styles.skeletonRow}>
            <Skeleton width="140px" height="18px" radius="6px" isGuest={isGuest} />
            <Skeleton width="70px" height="28px" radius="12px" isGuest={isGuest} />
          </div>
          <div className={styles.skeletonRowCenter}>
            <Skeleton width="64px" height="64px" radius="16px" isGuest={isGuest} />
            <div>
              <Skeleton width="140px" height="32px" radius="8px" isGuest={isGuest} />
              <Skeleton width="90px" height="14px" radius="4px" isGuest={isGuest} />
            </div>
          </div>
        </SkeletonCard>

        {/* Current Dues */}
        <SkeletonCard isGuest={isGuest}>
          <div className={styles.skeletonRow}>
            <Skeleton width="120px" height="18px" radius="6px" isGuest={isGuest} />
            <Skeleton width="70px" height="28px" radius="12px" isGuest={isGuest} />
          </div>
          <div className={styles.skeletonRowCenter}>
            <Skeleton width="64px" height="64px" radius="16px" isGuest={isGuest} />
            <div>
              <Skeleton width="120px" height="32px" radius="8px" isGuest={isGuest} />
              <Skeleton width="90px" height="14px" radius="4px" isGuest={isGuest} />
            </div>
          </div>
        </SkeletonCard>

        {/* Meals spanning 2 cols */}
        <SkeletonCard className={styles.skeletonSpan2} isGuest={isGuest}>
          <div className={styles.skeletonRow}>
            <Skeleton width="220px" height="18px" radius="6px" isGuest={isGuest} />
          </div>
          <div className={styles.skeletonMealGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonMealRow}>
                <Skeleton width="56px" height="56px" radius="16px" isGuest={isGuest} />
                <div>
                  <Skeleton width="80px" height="16px" radius="4px" isGuest={isGuest} />
                  <Skeleton width="100px" height="12px" radius="4px" isGuest={isGuest} />
                </div>
                <Skeleton width="54px" height="32px" radius="30px" className={styles.skeletonToggle} isGuest={isGuest} />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Quick Services */}
        <SkeletonCard isGuest={isGuest}>
          <Skeleton width="130px" height="18px" radius="6px" isGuest={isGuest} />
          <Skeleton width="100%" height="60px" radius="16px" isGuest={isGuest} />
          <Skeleton width="100%" height="60px" radius="16px" isGuest={isGuest} />
        </SkeletonCard>
      </div>
    </>
  );
}

/* ── Finance Skeleton ── */
export function FinanceSkeleton() {
  return (
    <div className={styles.skeletonFinanceGrid}>
      {/* Left: Form placeholder */}
      <SkeletonCard className={styles.skeletonFinanceForm}>
        <Skeleton width="180px" height="24px" radius="6px" />
        <Skeleton width="260px" height="14px" radius="4px" />
        <div className={styles.skeletonRow} style={{ marginTop: '1rem' }}>
          <Skeleton width="48%" height="48px" radius="16px" />
          <Skeleton width="48%" height="48px" radius="16px" />
        </div>
        <div className={styles.skeletonRow}>
          <Skeleton width="48%" height="48px" radius="16px" />
          <Skeleton width="48%" height="48px" radius="16px" />
        </div>
        <Skeleton width="100%" height="180px" radius="16px" />
        <Skeleton width="100%" height="56px" radius="16px" />
      </SkeletonCard>

      {/* Right: Stats + History */}
      <div className={styles.skeletonFinanceRight}>
        <div className={styles.skeletonStatsGrid}>
          <SkeletonCard>
            <Skeleton width="110px" height="14px" radius="4px" />
            <Skeleton width="140px" height="32px" radius="8px" />
          </SkeletonCard>
          <SkeletonCard>
            <Skeleton width="100px" height="14px" radius="4px" />
            <Skeleton width="120px" height="32px" radius="8px" />
          </SkeletonCard>
        </div>
        <SkeletonCard>
          <Skeleton width="160px" height="20px" radius="6px" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonHistoryItem}>
              <Skeleton width="44px" height="44px" radius="12px" />
              <div style={{ flex: 1 }}>
                <Skeleton width="120px" height="16px" radius="4px" />
                <Skeleton width="80px" height="12px" radius="4px" />
              </div>
              <Skeleton width="70px" height="24px" radius="8px" />
            </div>
          ))}
        </SkeletonCard>
      </div>
    </div>
  );
}

/* ── Notice Board Skeleton ── */
export function NoticeSkeleton() {
  return (
    <div className={styles.skeletonNoticeList}>
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i}>
          <div className={styles.skeletonRowCenter}>
            <Skeleton width="54px" height="54px" radius="16px" />
            <div style={{ flex: 1 }}>
              <Skeleton width="200px" height="18px" radius="6px" />
              <Skeleton width="120px" height="12px" radius="4px" />
            </div>
            <Skeleton width="80px" height="28px" radius="12px" />
          </div>
          <div style={{ paddingLeft: '4.5rem', marginTop: '1rem' }}>
            <Skeleton width="100%" height="14px" radius="4px" />
            <Skeleton width="85%" height="14px" radius="4px" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

/* ── Report Issue Skeleton ── */
export function ReportSkeleton() {
  return (
    <div className={styles.skeletonReportGrid}>
      {/* Form */}
      <SkeletonCard>
        <Skeleton width="120px" height="16px" radius="4px" />
        <Skeleton width="100%" height="48px" radius="16px" />
        <Skeleton width="100px" height="16px" radius="4px" />
        <Skeleton width="100%" height="120px" radius="16px" />
        <Skeleton width="140px" height="16px" radius="4px" />
        <Skeleton width="100%" height="120px" radius="16px" />
        <Skeleton width="100%" height="52px" radius="16px" />
      </SkeletonCard>

      {/* Tickets */}
      <SkeletonCard>
        <Skeleton width="140px" height="18px" radius="6px" />
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonHistoryItem}>
            <Skeleton width="44px" height="44px" radius="50%" />
            <div style={{ flex: 1 }}>
              <Skeleton width="180px" height="14px" radius="4px" />
              <Skeleton width="110px" height="12px" radius="4px" />
            </div>
            <Skeleton width="70px" height="24px" radius="12px" />
          </div>
        ))}
      </SkeletonCard>
    </div>
  );
}
