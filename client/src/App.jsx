import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Pages/Login/Login"
import { ThemeProvider } from './Context/ThemeContext';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';

// Admin Page Imports
import Admin_Dashboard from './Pages/Admin/AD_DashBoard';
import Admin_Residents from './Pages/Admin/AD_Residents';
import Admin_Kitchen from './Pages/Admin/AD_Kitchen';
import Admin_Payment from './Pages/Admin/AD_Payment';
import Admin_Maintenance from './Pages/Admin/AD_Maintenance';
import Admin_Settings from './Pages/Admin/AD_Settings';
import Admin_AddResident from './Pages/Admin/AD_Add_Residents';
import Admin_UpdateMenu from './Pages/Admin/AD_Update_Menu';
import Admin_Record_Payment from './Pages/Admin/AD_Record_Payment';
import Admin_View_Payment from './Pages/Admin/AD_View_Payment';
import Admin_View_Resident from './Pages/Admin/AD_View_Resident';
import AdminEditResident from './Pages/Admin/AD_Edit_Resident';

// Resident Page Imports
import Resident_Dashboard from './Pages/Resident/RD_Dashboard';
import Resident_ReportIssue from './Pages/Resident/RD_Report_Issue';
import Resident_Finance from './Pages/Resident/RD_Finance';
import Resident_NoticeBoard from './Pages/Resident/RD_Notice_Board';

function getDashboardPathByRole(role) {
  return role === 'resident' ? '/resident/dashboard' : '/admin/dashboard';
}

function HomeRedirect() {
  const storedUser = sessionStorage.getItem('user');
  if (!storedUser) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(storedUser);
    return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
  } catch {
    sessionStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          {/* Root Route */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes - Protected */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_Dashboard /></ProtectedRoute>} />
          <Route path="/admin/residents" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_Residents /></ProtectedRoute>} />
          <Route path="/admin/residents/add" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_AddResident /></ProtectedRoute>} />
          <Route path="/admin/residents/view/:phone" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_View_Resident /></ProtectedRoute>} />
          <Route path="/admin/resident/edit/:phone" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><AdminEditResident /></ProtectedRoute>} />
          <Route path="/admin/kitchen" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_Kitchen /></ProtectedRoute>} />
          <Route path="/admin/kitchen/update" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_UpdateMenu /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_Payment /></ProtectedRoute>} />
          <Route path="/admin/payments/add" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_Record_Payment /></ProtectedRoute>} />
          <Route path="/admin/payments/view" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_View_Payment /></ProtectedRoute>} />
          <Route path="/admin/maintenance" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_Maintenance /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Admin_Settings /></ProtectedRoute>} />

          {/* Resident Routes - Protected */}
          <Route path="/resident/dashboard" element={<ProtectedRoute allowedRoles={['resident']}><Resident_Dashboard /></ProtectedRoute>} />
          <Route path="/resident/report" element={<ProtectedRoute allowedRoles={['resident']}><Resident_ReportIssue /></ProtectedRoute>} />
          <Route path="/resident/finance" element={<ProtectedRoute allowedRoles={['resident']}><Resident_Finance /></ProtectedRoute>} />
          <Route path="/resident/notice" element={<ProtectedRoute allowedRoles={['resident']}><Resident_NoticeBoard /></ProtectedRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App