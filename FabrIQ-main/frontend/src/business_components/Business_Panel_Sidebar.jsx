import React, { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaPlus,
  FaArchive,
  FaBox,
  FaUserFriends,
  FaCog,
  FaBars,
  FaBuilding,
  FaStar,
  FaSignOutAlt,
  FaRobot,
  FaMoneyBillWave,
} from "react-icons/fa";
import { sidebarItems } from "../assets/sidebarData";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../utility/logoutUser";

const iconComponents = {
  FaHome,
  FaPlus,
  FaArchive,
  FaBox,
  FaUserFriends,
  FaCog,
  FaStar,
  FaSignOutAlt,
  FaBuilding,
  FaRobot,
  FaMoneyBillWave,
};

function Sidebar({ panelType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAiAccess, setHasAiAccess] = useState(
    localStorage.getItem("has_ai_access") === "true"
  );

  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const currentSidebarItems = sidebarItems[panelType] || [];

  useEffect(() => {
    const handleStorageChange = () => {
      setHasAiAccess(localStorage.getItem("has_ai_access") === "true");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      localStorage.removeItem("has_ai_access"); 
      setHasAiAccess(false);
      navigate("/login");
      setIsOpen(false);
    }
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsOpen(false);
  };

  return (
    <div ref={sidebarRef} className="z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <div className="fixed top-20 left-4 z-[60]">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white/30 hover:bg-white/60 backdrop-blur-md p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
          >
            <FaBars className="text-xl text-gray-800" />
          </button>
        </div>
      )}

      {/* Animated Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="fixed top-0 left-0 h-screen w-[80%] max-w-[260px] bg-white/70 backdrop-blur-lg border-r border-white/20 shadow-2xl p-6 pt-10 rounded-r-3xl z-50"
          >
            {/* Title */}
            <div className="mb-6 text-2xl font-semibold text-gray-800 tracking-tight">
              {panelType
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </div>

            {/* Scrollable Nav Items */}
            <nav className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 custom-scrollbar">
              {currentSidebarItems.map((item, index) => {
                if (item.type === "heading") {
                  return (
                    <span
                      key={index}
                      className="uppercase text-xs font-semibold text-gray-500 tracking-widest mt-4"
                    >
                      {item.text}
                    </span>
                  );
                } else if (item.type === "link") {
                  if (item.href === "/ai-product" && !hasAiAccess) {
                    return null;
                  }

                  const Icon = iconComponents[item.icon];
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={index}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-black text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      <Icon className="text-lg" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </Link>
                  );
                }
                return null;
              })}

              <button
                onClick={handleSettings}
                className={`mt-6 flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-200 ${
                  location.pathname === "/settings"
                    ? "bg-black text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <FaCog className="text-lg" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 mt-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Sidebar;
