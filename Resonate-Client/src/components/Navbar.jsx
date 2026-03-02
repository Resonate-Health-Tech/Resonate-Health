import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../App";

import DesktopNav from "./nav/DesktopNav";
import MobileMenu from "./nav/MobileMenu";
import BottomNav from "./nav/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Main navigation bar component.
 * Refactored from 527 lines to ~90 lines using subcomponents.
 */
export default function Navbar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;
  const isActiveGroup = (paths) => paths.some((p) => location.pathname.startsWith(p));

  const handleConnectGoogleFit = () => {
    window.location.href = `${API_BASE_URL}/api/fit/google`;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-2xl font-black bg-gradient-to-br from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                  R
                </span>
              </div>
              <span className="text-lg font-bold text-slate-50 hidden sm:inline">Resonate</span>
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav
              user={user}
              isActive={isActive}
              isActiveGroup={isActiveGroup}
              userMenuOpen={userMenuOpen}
              setUserMenuOpen={setUserMenuOpen}
              onConnectGoogleFit={handleConnectGoogleFit}
              onLogout={handleLogout}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onConnectGoogleFit={handleConnectGoogleFit}
        onLogout={handleLogout}
      />

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav isActive={isActive} isActiveGroup={isActiveGroup} />
    </>
  );
}

