import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from "./Pages/Login/Login"
import Admin_Dashboard from './Pages/Admin/AD_DashBoard';

function App() {

  const navigate = useNavigate();

  return (
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<Admin_Dashboard />} />





        {/* Default Redirect */}
        <Route path="*" element={navigate("/login")} />
      </Routes>
  )
}

export default App