// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import logo from "../assets/truck.jpg";

// --- Color Palette ---
const colors = {
  primaryRed: '#295b52',
  darkRed: 'rgba(94, 172, 131, 0.8)',
  lightBeige: '#F7EFE9',
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#4A4A4A',
  lightGray: '#E2E2E2',
};

// --- Reusable Button Styles ---
const buttonStyles = {
  backgroundColor: colors.primaryRed,
  color: colors.white,
  border: 'none',
  transition: 'background-color 0.2s ease-in-out',
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("admin"); // 'admin' or 'driver'

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError("");

    try {
      let response;
      
      if (loginType === 'admin') {
        // Admin login
        response = await axiosInstance.post('/auth/login', {
          loginType: 'admin',
          email: loginEmail,
          password: loginPassword,
        });
      } else {
        // Driver login (using email field as user_id_code, password as pin)
        response = await axiosInstance.post('/auth/login', {
          loginType: 'driver',
          user_id_code: loginEmail,
          pin: loginPassword,
        });
      }

      if (response.data.success && response.data.token) {
        // Store token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role.toUpperCase());
        localStorage.setItem('userEmail', response.data.user.email || loginEmail);
        localStorage.setItem('userId', response.data.user.id);
        
        if (response.data.user.driverId) {
          localStorage.setItem('driverId', response.data.user.driverId);
        }
        if (response.data.user.name) {
          localStorage.setItem('userName', response.data.user.name);
        }

        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/driver/dashboard");
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  const directAdminLogin = () => {
    setLoginType('admin');
    handleLogin("admin@m.com", "password");
  };

  const directDriverLogin = () => {
    setLoginType('driver');
    handleLogin("DRV001", "1234");
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="card shadow w-100" style={{ maxWidth: "950px", borderRadius: "1.5rem", backgroundColor: colors.white }}>
        <div className="row g-0">
          <div className="col-md-6 d-none d-md-block">
            <img
              src={logo}
              alt="business dashboard"
              className="img-fluid rounded-start"
              style={{ 
                height: "100%", 
                objectFit: "cover", 
                objectPosition: 'center bottom'
              }}
            />
          </div>

          <div className="col-md-6 d-flex align-items-center p-5">
            <div className="w-100">
              <h2 className="fw-bold mb-3 text-center" style={{ color: colors.black }}>Welcome Back!</h2>
              <p className="text-center mb-4" style={{ color: colors.darkGray }}>Please login to your account</p>

              {error && (
                <div className="alert alert-danger mb-3">{error}</div>
              )}

              {/* Quick login buttons */}
              <div className="mb-4">
                <p className="mb-2" style={{ color: colors.darkGray }}><strong>Quick Login (Dev Mode):</strong></p>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ ...buttonStyles, ...(loading ? { backgroundColor: '#cccccc', cursor: 'not-allowed' } : {}) }}
                    onClick={directAdminLogin}
                    disabled={loading}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = colors.darkRed)}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = colors.primaryRed)}
                  >
                    Admin Login
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ ...buttonStyles, ...(loading ? { backgroundColor: '#cccccc', cursor: 'not-allowed' } : {}) }}
                    onClick={directDriverLogin}
                    disabled={loading}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = colors.darkRed)}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = colors.primaryRed)}
                  >
                    Driver Login
                  </button>
                </div>
              </div>

              {/* Login Type Toggle */}
              <div className="mb-3">
                <label className="form-label">Login As:</label>
                <select
                  className="form-select"
                  value={loginType}
                  onChange={(e) => setLoginType(e.target.value)}
                >
                  <option value="admin">Admin (Email/Password)</option>
                  <option value="driver">Driver (User ID Code/PIN)</option>
                </select>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    {loginType === 'admin' ? 'Email address' : 'User ID Code'}
                  </label>
                  <input
                    type={loginType === 'admin' ? 'email' : 'text'}
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={loginType === 'admin' ? 'admin@m.com' : 'DRV001'}
                    required
                  />
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label">
                    {loginType === 'admin' ? 'Password' : '4-Digit PIN'}
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={loginType === 'admin' ? 'password' : '1234'}
                      maxLength={loginType === 'driver' ? 4 : undefined}
                      required
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y pe-3"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer", zIndex: 10 }}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn w-100 py-2"
                  style={{ ...buttonStyles, ...(loading ? { backgroundColor: '#cccccc', cursor: 'not-allowed' } : {}) }}
                  disabled={loading}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = colors.darkRed)}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = colors.primaryRed)}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
