import styles from './Skeleton.module.css';

export function Skeleton({ width, height, radius, className = '' }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function SkeletonCard({ children, className = '' }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      {children}
    </div>
  );
}

/* ── Residents Directory Skeleton ── */
export function ResidentsSkeleton() {
  return (
    <>
      {/* Stats Row */}
      <div className={styles.skeletonStatsRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <Skeleton width="32px" height="32px" radius="8px" />
            <Skeleton width="120px" height="14px" radius="4px" />
            <Skeleton width="80px" height="40px" radius="8px" />
          </SkeletonCard>
        ))}
      </div>

      {/* Filter Row */}
      <div className={styles.skeletonFilterRow}>
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100%" height="44px" radius="12px" />
      </div>

      {/* Table */}
      <SkeletonCard className={styles.skeletonTableCard}>
        {/* Table Header */}
        <div className={styles.skeletonTableHeader}>
          <Skeleton width="120px" height="12px" radius="4px" />
          <Skeleton width="80px" height="12px" radius="4px" />
          <Skeleton width="80px" height="12px" radius="4px" />
          <Skeleton width="110px" height="12px" radius="4px" />
          <Skeleton width="100px" height="12px" radius="4px" />
          <Skeleton width="70px" height="12px" radius="4px" />
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonTableRow}>
            <div className={styles.skeletonRowCenter}>
              <Skeleton width="36px" height="36px" radius="50%" />
              <Skeleton width="120px" height="16px" radius="4px" />
            </div>
            <Skeleton width="90px" height="28px" radius="20px" />
            <Skeleton width="50px" height="16px" radius="4px" />
            <Skeleton width="100px" height="16px" radius="4px" />
            <Skeleton width="90px" height="16px" radius="4px" />
            <Skeleton width="60px" height="32px" radius="6px" />
          </div>
        ))}
      </SkeletonCard>
    </>
  );
}

/* ── View Resident Profile Skeleton ── */
export function ViewResidentSkeleton() {
  return (
    <div className={styles.skeletonViewGrid}>
      {/* Left Card: Profile Info */}
      <SkeletonCard>
        {/* Profile Header */}
        <div className={styles.skeletonProfileHeader}>
          <Skeleton width="70px" height="70px" radius="50%" />
          <div className={styles.skeletonProfileInfo}>
            <Skeleton width="180px" height="24px" radius="6px" />
            <Skeleton width="100px" height="28px" radius="8px" />
          </div>
        </div>

        {/* Detail Rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.skeletonDetailRow}>
            <Skeleton width="120px" height="14px" radius="4px" />
            <Skeleton width="160px" height="14px" radius="4px" />
          </div>
        ))}

        {/* Action Buttons */}
        <div className={styles.skeletonActions}>
          <Skeleton width="100%" height="44px" radius="12px" />
          <Skeleton width="100%" height="44px" radius="12px" />
        </div>
      </SkeletonCard>

      {/* Right Card: Document */}
      <SkeletonCard>
        <Skeleton width="160px" height="20px" radius="6px" />
        <Skeleton width="100%" height="300px" radius="16px" />
      </SkeletonCard>
    </div>
  );
}

/* ── Edit Resident Form Skeleton ── */
export function EditResidentSkeleton() {
  return (
    <SkeletonCard>
      <div className={styles.skeletonEditGrid}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={styles.skeletonFieldGroup}>
            <Skeleton width="100px" height="12px" radius="4px" />
            <Skeleton width="100%" height="44px" radius="10px" />
          </div>
        ))}
      </div>
      <div className={styles.skeletonActionsEnd}>
        <Skeleton width="100px" height="42px" radius="10px" />
        <Skeleton width="120px" height="42px" radius="10px" />
      </div>
    </SkeletonCard>
  );
}

/* ── Payments Page Skeleton ── */
export function PaymentSkeleton() {
  return (
    <>
      {/* Summary Cards */}
      <div className={styles.skeletonStatsRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <Skeleton width="140px" height="14px" radius="4px" />
            <Skeleton width="100px" height="32px" radius="6px" />
            <Skeleton width="90px" height="24px" radius="20px" />
          </SkeletonCard>
        ))}
      </div>

      {/* Filter Row */}
      <div className={styles.skeletonFilterRow}>
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100px" height="44px" radius="12px" />
      </div>

      {/* Table */}
      <SkeletonCard className={styles.skeletonTableCard}>
        <div className={styles.skeletonTableHeader}>
          <Skeleton width="100px" height="12px" radius="4px" />
          <Skeleton width="70px" height="12px" radius="4px" />
          <Skeleton width="70px" height="12px" radius="4px" />
          <Skeleton width="70px" height="12px" radius="4px" />
          <Skeleton width="60px" height="12px" radius="4px" />
          <Skeleton width="90px" height="12px" radius="4px" />
          <Skeleton width="70px" height="12px" radius="4px" />
          <Skeleton width="50px" height="12px" radius="4px" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonTableRow}>
            <div className={styles.skeletonRowCenter}>
              <Skeleton width="36px" height="36px" radius="50%" />
              <Skeleton width="110px" height="16px" radius="4px" />
            </div>
            <Skeleton width="50px" height="16px" radius="4px" />
            <Skeleton width="90px" height="16px" radius="4px" />
            <Skeleton width="70px" height="16px" radius="4px" />
            <Skeleton width="80px" height="16px" radius="4px" />
            <Skeleton width="60px" height="24px" radius="8px" />
            <Skeleton width="80px" height="28px" radius="20px" />
            <Skeleton width="32px" height="32px" radius="8px" />
          </div>
        ))}
      </SkeletonCard>

      {/* Mobile cards skeleton (hidden on desktop via CSS) */}
      <div className={styles.skeletonMobileCards}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <div className={styles.skeletonRowCenter}>
              <Skeleton width="40px" height="40px" radius="50%" />
              <div>
                <Skeleton width="120px" height="16px" radius="4px" />
                <Skeleton width="70px" height="12px" radius="4px" />
              </div>
            </div>
            <Skeleton width="100%" height="1px" radius="0" />
            <div className={styles.skeletonRowBetween}>
              <Skeleton width="70px" height="14px" radius="4px" />
              <Skeleton width="70px" height="14px" radius="4px" />
              <Skeleton width="70px" height="14px" radius="4px" />
            </div>
            <Skeleton width="100%" height="36px" radius="10px" />
          </SkeletonCard>
        ))}
      </div>
    </>
  );
}

/* ── Verify Payments Skeleton ── */
export function VerifyPaymentSkeleton() {
  return (
    <SkeletonCard className={styles.skeletonTableCard}>
      <div className={styles.skeletonTableHeader}>
        <Skeleton width="80px" height="12px" radius="4px" />
        <Skeleton width="100px" height="12px" radius="4px" />
        <Skeleton width="90px" height="12px" radius="4px" />
        <Skeleton width="60px" height="12px" radius="4px" />
        <Skeleton width="60px" height="12px" radius="4px" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonTableRow}>
          <Skeleton width="120px" height="16px" radius="4px" />
          <Skeleton width="100px" height="16px" radius="4px" />
          <Skeleton width="80px" height="16px" radius="4px" />
          <Skeleton width="90px" height="16px" radius="4px" />
          <Skeleton width="60px" height="32px" radius="8px" />
        </div>
      ))}
    </SkeletonCard>
  );
}

/* ── Kitchen Page Skeleton ── */
export function KitchenSkeleton() {
  return (
    <>
      {/* Meal Cards Grid */}
      <div className={styles.skeletonMealGrid}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className={styles.skeletonMealCard}>
            <div className={styles.skeletonRowBetween}>
              <div>
                <Skeleton width="100px" height="20px" radius="6px" />
                <Skeleton width="150px" height="14px" radius="4px" />
              </div>
              <Skeleton width="56px" height="56px" radius="12px" />
            </div>
            <Skeleton width="100%" height="1px" radius="0" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className={styles.skeletonRowCenter}>
                <Skeleton width="8px" height="8px" radius="50%" />
                <Skeleton width="140px" height="14px" radius="4px" />
              </div>
            ))}
          </SkeletonCard>
        ))}
      </div>

      {/* Participation Section Header */}
      <div style={{ marginTop: '1.5rem' }}>
        <Skeleton width="200px" height="22px" radius="6px" />
        <Skeleton width="150px" height="14px" radius="4px" className={styles.skeletonMt} />
      </div>

      {/* Participation Cards Grid */}
      <div className={styles.skeletonMealGrid}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className={styles.skeletonParticipationCard}>
            <div className={styles.skeletonRowCenter}>
              <Skeleton width="48px" height="48px" radius="12px" />
              <div>
                <Skeleton width="90px" height="18px" radius="6px" />
                <div className={styles.skeletonRowCenter} style={{ marginTop: '0.5rem' }}>
                  <Skeleton width="40px" height="28px" radius="8px" />
                  <Skeleton width="40px" height="28px" radius="8px" />
                </div>
              </div>
            </div>
            <Skeleton width="110px" height="32px" radius="8px" />
          </SkeletonCard>
        ))}
      </div>
    </>
  );
}

/* ── Maintenance Reports Skeleton ── */
export function ReportsSkeleton() {
  return (
    <>
      {/* Stats Row */}
      <div className={styles.skeletonStatsRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <Skeleton width="100px" height="14px" radius="4px" />
            <Skeleton width="60px" height="40px" radius="8px" />
            <Skeleton width="110px" height="24px" radius="20px" />
          </SkeletonCard>
        ))}
      </div>

      {/* Filter Row */}
      <div className={styles.skeletonFilterRow}>
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100%" height="44px" radius="12px" />
        <Skeleton width="100%" height="44px" radius="12px" />
      </div>

      {/* Table */}
      <SkeletonCard className={styles.skeletonTableCard}>
        <div className={styles.skeletonTableHeader}>
          <Skeleton width="100px" height="12px" radius="4px" />
          <Skeleton width="80px" height="12px" radius="4px" />
          <Skeleton width="90px" height="12px" radius="4px" />
          <Skeleton width="80px" height="12px" radius="4px" />
          <Skeleton width="70px" height="12px" radius="4px" />
          <Skeleton width="70px" height="12px" radius="4px" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonTableRow}>
            <div className={styles.skeletonRowCenter}>
              <Skeleton width="36px" height="36px" radius="50%" />
              <div>
                <Skeleton width="110px" height="14px" radius="4px" />
                <Skeleton width="80px" height="10px" radius="4px" />
              </div>
            </div>
            <Skeleton width="80px" height="16px" radius="4px" />
            <Skeleton width="60px" height="30px" radius="8px" />
            <Skeleton width="90px" height="16px" radius="4px" />
            <Skeleton width="80px" height="26px" radius="20px" />
            <Skeleton width="90px" height="30px" radius="8px" />
          </div>
        ))}
      </SkeletonCard>

      {/* Mobile cards skeleton */}
      <div className={styles.skeletonMobileCards}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <div className={styles.skeletonRowBetween}>
              <div className={styles.skeletonRowCenter}>
                <Skeleton width="38px" height="38px" radius="50%" />
                <div>
                  <Skeleton width="110px" height="14px" radius="4px" />
                  <Skeleton width="80px" height="10px" radius="4px" />
                </div>
              </div>
              <Skeleton width="80px" height="26px" radius="20px" />
            </div>
            <Skeleton width="100%" height="1px" radius="0" />
            <div className={styles.skeletonRowBetween}>
              <Skeleton width="80px" height="14px" radius="4px" />
              <Skeleton width="90px" height="14px" radius="4px" />
            </div>
            <Skeleton width="60px" height="28px" radius="8px" />
            <Skeleton width="100%" height="38px" radius="8px" />
          </SkeletonCard>
        ))}
      </div>
    </>
  );
}

/* ── Announcements Skeleton ── */
export function AnnouncementsSkeleton() {
  return (
    <>
      {/* Stats Row */}
      <div className={styles.skeletonStatsRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <Skeleton width="80px" height="14px" radius="4px" />
            <Skeleton width="50px" height="40px" radius="8px" />
            <Skeleton width="120px" height="24px" radius="20px" />
          </SkeletonCard>
        ))}
      </div>

      {/* Announcement Cards */}
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i}>
          <div className={styles.skeletonRowBetween}>
            <div className={styles.skeletonRowCenter}>
              <Skeleton width="32px" height="32px" radius="8px" />
              <div>
                <Skeleton width="180px" height="18px" radius="6px" />
                <Skeleton width="70px" height="20px" radius="20px" />
              </div>
            </div>
            <Skeleton width="28px" height="28px" radius="8px" />
          </div>
          <Skeleton width="90%" height="14px" radius="4px" />
          <Skeleton width="60%" height="14px" radius="4px" />
          <Skeleton width="130px" height="12px" radius="4px" />
        </SkeletonCard>
      ))}
    </>
  );
}
