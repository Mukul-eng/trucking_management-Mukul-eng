import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";

// Layout
import Navbar from "./Layout/Navbar";
import Sidebar from "./Layout/Sidebar";

// Auth Pages
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ForgotPassword from "./Auth/ForgotPassword";

// Admin
import AdminDashboard from "./Dashboard/Admin/AdminDashboard";

import AdminInvoice from "./Dashboard/Admin/AdminInvoice";
import AdminTicketInbox from "./Dashboard/Admin/AdminTicketInbox";
import AdminSettlements from "./Dashboard/Admin/AdminSettlements";
import AdminSettings from "./Dashboard/Admin/AdminSettings";
import DriverDashboard from "./Dashboard/Driver/DriverDashboard";
import DriverAddTicket from "./Dashboard/Driver/DriverAddTicket";
import DriverMyPay from "./Dashboard/Driver/DriverMyPay";
import DriverProfile from "./Dashboard/Driver/DriverProfile";
import AddDriver from "./Dashboard/Admin/AddDriver";



function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Pages where sidebar + navbar should NOT show
  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password";

  return (
    <>
      {hideLayout ? (
        // -------- AUTH ROUTES --------
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      ) : (
        // -------- MAIN LAYOUT --------
        <>
          <Navbar toggleSidebar={toggleSidebar} />

          <div className="main-content">
            {/* Sidebar */}
            <Sidebar
              collapsed={isSidebarCollapsed}
              setCollapsed={setIsSidebarCollapsed}
            />

            {/* Right Content */}
            <div className={`right-side-content ${isSidebarCollapsed ? "collapsed" : ""}`}>
              <Routes>
                {/* ---------------- ADMIN ---------------- */}
                <Route path="/admin/dashboard" element={<AdminDashboard/>} />
                <Route path="/admin/invoice" element={<AdminInvoice/>} />
                <Route path="/admin/ticket-inbox" element={<AdminTicketInbox/>} />
                <Route path="/admin/settlements" element={<AdminSettlements/>} />
                <Route path="/admin/settings" element={<AdminSettings/>} />
                <Route path="/admin/add-driver" element={<AddDriver/>} />
                {/* ---------------- Driver ---------------- */}
                <Route path="/driver/dashboard" element={<DriverDashboard/>} />
                <Route path="/driver/add-ticket" element={<DriverAddTicket/>} />
                <Route path="/driver/my-pay" element={<DriverMyPay/>} />
                <Route path="/driver/profile" element={<DriverProfile/>} />

              </Routes>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
