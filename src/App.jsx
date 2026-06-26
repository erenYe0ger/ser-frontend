// src/App.jsx

import { useState, useEffect } from "react";
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

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "analyse";
  });

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
  
  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  if (!isLoggedIn) {
    return (
      <LandingPage
        onGoogleLogin={handleGoogleLogin}
        onGuestLogin={handleGuestLogin}
      />
    );
  }

  const currentUser = profile || user;

  const handleLogout = () => {
    setActivePage("analyse");
    logout();
  };

  
  return (
    <>
      <div className="bg-[#0f0f0f] min-h-screen">

        {/* Mobile Top Bar */}
        {!sidebarOpen && (
          <div className="fixed top-0 left-0 right-0 h-[60px] bg-[#0f0f0f] border-b border-[#222] flex items-center px-4 z-50 box-border md:hidden">
            <button
              className="bg-transparent text-white border-none text-[1.5rem] cursor-pointer p-1"
              onClick={toggleSidebar}
            >
              ☰
            </button>

            <span className="ml-4 text-white text-[26px] font-bold">
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
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}

        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          user={currentUser}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />

        <main className="ml-0 min-h-screen bg-[#0f0f0f] transition-[margin-left] duration-300 ease-out pt-[60px] md:ml-[240px] md:pt-0">
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