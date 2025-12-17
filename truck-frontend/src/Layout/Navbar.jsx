import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaBars, FaSignOutAlt } from "react-icons/fa";

const Navbar = ({ toggleSidebar }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // dummy profile state
  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@gymapp.com",
    phone: "+91 90000 00000",
    role: "Super Admin",
    branch: "All Branches",
    notifyEmail: true,
    notifySMS: false,
  });

  // prevent background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showProfileModal ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showProfileModal]);

  const handleSaveProfile = () => {
    // TODO: call API to save
    alert("Profile saved!");
    setShowProfileModal(false);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand px-3 py-2 d-flex justify-content-between align-items-center fixed-top"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {/* Toggle Button with Custom Hover */}
          <button
            className="btn p-2"
            style={{
              // backgroundColor: "transparent",
              borderColor: "#295b52",
              color: "#295b52",
              borderRadius: "6px",
              border: "2px solid #295b52",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#295b52";
              e.target.style.color = "#FFFFFF";
              e.target.style.borderColor = "#295b52";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.color = "#295b52";
              e.target.style.borderColor = "#295b52";
            }}
            onClick={toggleSidebar}
          >
            <FaBars color="currentColor" />
          </button>

          {/* Text Logo */}
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#000000",
              letterSpacing: "-0.5px",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span style={{ color: "#295b52", fontWeight: "800" }}>Trucking</span>
          </span>
        </div>

        {/* User Profile and Logout */}
        <div className="d-flex align-items-center gap-3">
          {/* User Profile Icon - clickable to open profile modal */}
     
          
          {/* Direct Logout Button */}
          <a
            href="/"
            className="btn d-flex align-items-center gap-2"
            style={{
              // backgroundColor: "transparent",
              borderColor: "#295b52",
              color: "#295b52",
              borderRadius: "6px",
              border: "2px solid #295b52",
              transition: "all 0.3s ease",
              padding: "0.375rem 0.75rem",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#295b52";
              e.target.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.color = "#295b52";
            }}
          >
            <FaSignOutAlt size={16} />
            <span className="d-none d-sm-inline">Logout</span>
          </a>
        </div>
      </nav>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                 <div className="d-flex align-items-center gap-3 mb-3">
                  <FaUserCircle size={48} color="#6c757d" />
               
                <h5 className="modal-title fw-bold">My Profile</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProfileModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      style={{ borderColor: "#E2E2E2" }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      style={{ borderColor: "#E2E2E2" }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      style={{ borderColor: "#E2E2E2" }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Branch</label>
                    <select
                      className="form-select"
                      value={profile.branch}
                      onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                      style={{ borderColor: "#E2E2E2" }}
                    >
                      <option>All Branches</option>
                      <option>Andheri</option>
                      <option>Bandra</option>
                      <option>Thane</option>
                      <option>Pune</option>
                    </select>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Password change */}
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" style={{ borderColor: "#E2E2E2" }} />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" style={{ borderColor: "#E2E2E2" }} />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" style={{ borderColor: "#E2E2E2" }} />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowProfileModal(false)}
                  style={{ borderColor: "#4A4A4A", color: "#4A4A4A" }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveProfile}
                  style={{ backgroundColor: "#295b52", borderColor: "#295b52" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;