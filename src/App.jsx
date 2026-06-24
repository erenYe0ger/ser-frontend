// src/App.jsx

import axios from "axios";

import useAuth from "./auth/useAuth";
import LandingPage from "./pages/LandingPage";
import AppPage from "./pages/AppPage";

function App() {
  const {
    token,
    user,
    profile,
    isLoggedIn,
    loginWithToken,
    logout,
  } = useAuth();

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

  if (isLoggedIn) {
    return (
      <AppPage
        token={token}
        user={user}
        profile={profile}
        onLogout={logout}
      />
    );
  }

  return (
    <LandingPage
      onGoogleLogin={handleGoogleLogin}
      onGuestLogin={handleGuestLogin}
    />
  );
}

export default App;