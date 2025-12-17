import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faCreditCard,
  faList,
  faCog,
  faHome,
  faClock,
  faPlusSquare,
  faMoneyBillWave,
  faSignOutAlt,
  faCamera,
  faHistory,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";

import "./Sidebar.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  useEffect(() => {
    // Get role from localStorage and ensure it's uppercase to match our keys
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role.toUpperCase());
    }
  }, []);

  // Listen for storage changes to update role when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem("userRole");
      if (role) {
        setUserRole(role.toUpperCase());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  const toggleSubmenu = (index) => {
    if (activeSubmenu === index) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(index);
    }
  };

  // Admin menu items
  const adminMenus = [
    {
      name: "Dashboard",
      icon: faChartBar,
      path: "/admin/dashboard"
    },
    {
      name: "Ticket Inbox",
      icon: faUsers,
      path: "/admin/ticket-inbox"
    },
    {
      name: "Add Driver",
      icon: faUsers,
      path: "/admin/add-driver"
    },
    {
      name: "Invoice",
      icon: faCreditCard,
      path: "/admin/invoice"
    },
    {
      name: "Settlements",
      icon: faList,
      path: "/admin/settlements"
    },
    {
      name: "Data Setup",
      icon: faCog,
      path: "/admin/settings"
    }
  ];

  // Driver menu items based on the mobile app screens
  const driverMenus = [
    {
      name: "Dashboard",
      icon: faHome,
      path: "/driver/dashboard"
    },
    {
      name: "Add Ticket",
      icon: faPlusSquare,
      path: "/driver/add-ticket"
    },
    
    {
      name: "My Pay",
      icon: faMoneyBillWave,
      path: "/driver/my-pay"
    },
    {
      name: "Profile",
      icon: faSignOutAlt,
      path: "/driver/profile"
    }
  ];

  // Determine which menus to show based on user role
  const showAdminMenus = userRole === "ADMIN";
  const showDriverMenus = userRole === "DRIVER";

  // Add a loading state or fallback if userRole is still null
  if (!userRole) {
    return (
      <div className="sidebar-container">
        <div className="sidebar">
          <div className="p-3 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        <ul className="menu">
          {showAdminMenus && adminMenus.map((menu, index) => (
            <li key={index} className="menu-item">
              <div
                className={`menu-link ${isActive(menu.path) ? "active" : ""}`}
                onClick={() => handleNavigate(menu.path)}
              >
                <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                {!collapsed && <span className="menu-text">{menu.name}</span>}
              </div>
            </li>
          ))}
          
          {showDriverMenus && driverMenus.map((menu, index) => (
            <li key={index} className="menu-item">
              <div
                className={`menu-link ${isActive(menu.path) ? "active" : ""}`}
                onClick={() => handleNavigate(menu.path)}
              >
                <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                {!collapsed && <span className="menu-text">{menu.name}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;