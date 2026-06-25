// src/App.jsx

import { useState } from "react";
import axios from "axios";

import useAuth from "./auth/useAuth";
import LandingPage from "./pages/LandingPage";
import Sidebar from "./components/Sidebar";
import AnalysePage from "./pages/AnalysePage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const {
    token,
    user,
    profile,
    isLoggedIn,
    loginWithToken,
    logout,
  } = useAuth();

  const [activePage, setActivePage] =
    useState("analyse");

  // NEW
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const API_URL = import.meta.env.VITE_API_URL;

  const handleGoogleLogin = async (
    credentialResponse
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/google`,
        {
          token: credentialResponse.credential,
        }
      );

      loginWithToken(response.data);
    } catch (error) {
      console.error(
        "Google login failed:",
        error
      );
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/guest`
      );

      loginWithToken(response.data);
    } catch (error) {
      console.error(
        "Guest login failed:",
        error
      );
    }
  };

  if (!isLoggedIn) {
    return (
      <LandingPage
        onGoogleLogin={handleGoogleLogin}
        onGuestLogin={handleGuestLogin}
      />
    );
  }

  const currentUser = profile || user;

  return (
    <>
      <style>{`
          .mobile-topbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: #0f0f0f;
            border-bottom: 1px solid #222;
            display: flex;
            align-items: center;
            padding: 0 16px;
            z-index: 50;
            box-sizing: border-box;
          }

          .hamburger-btn {
            background: transparent;
            color: white;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 4px;
          }

          .mobile-title {
            margin-left: 16px;
            color: white;
            font-size: 26px;
            font-weight: 700;
          }

          .main-content {
            margin-left: 0;
            min-height: 100vh;
            background: #0f0f0f;
            transition: margin-left 0.3s ease;
            padding-top: 60px;
          }

          @media (min-width: 768px) {
            .mobile-topbar {
              display: none;
            }

            .main-content {
              margin-left: 240px;
              padding-top: 0;
            }
          }
      `}</style>

      <div
        style={{
          background: "#0f0f0f",
          minHeight: "100vh",
        }}
      >

        {/* Mobile Top Bar */}
        {!sidebarOpen && (
          <div className="mobile-topbar">
            <button
              className="hamburger-btn"
              onClick={toggleSidebar}
            >
              ☰
            </button>

            <span className="mobile-title">
              SER
            </span>
          </div>
        )}

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() =>
              setSidebarOpen(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.5)",
              zIndex: 40,
            }}
          />
        )}

        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          user={currentUser}
          onLogout={logout}
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />

        <main className="main-content">
          {activePage === "analyse" ? (
            <AnalysePage
              token={token}
              user={currentUser}
            />
          ) : (
            <HistoryPage
              token={token}
              user={currentUser}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default App;