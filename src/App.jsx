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
    <div
      style={{
        background: "#0f0f0f",
        minHeight: "100vh",
      }}
    >
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={currentUser}
        onLogout={logout}
      />

      <main
        style={{
          marginLeft: "240px",
          minHeight: "100vh",
          background: "#0f0f0f",
        }}
      >
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
  );
}

export default App;