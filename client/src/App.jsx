import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Pages/Login/Login"
import Admin_Dashboard from './Pages/Admin/AD_DashBoard';
import Admin_Residents from './Pages/Admin/AD_Residents';
import Admin_Kitchen from './Pages/Admin/AD_Kitchen';
import Admin_Payment from './Pages/Admin/AD_Payment';
import Admin_Maintenance from './Pages/Admin/AD_Maintenance';
import Admin_Settings from './Pages/Admin/AD_Settings';
import { ThemeProvider } from './Context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Root Route - Redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Admin_Dashboard />} />
        <Route path="/admin/residents" element={<Admin_Residents />} />
        <Route path="/admin/kitchen" element={<Admin_Kitchen />} />
        <Route path="/admin/payments" element={<Admin_Payment />} />
        <Route path="/admin/maintenance" element={<Admin_Maintenance />} />
        <Route path="/admin/settings" element={<Admin_Settings />} />

        {/* Default Redirect - Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App