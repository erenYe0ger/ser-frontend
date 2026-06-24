// src/auth/useAuth.js

import { useState } from "react";

const TOKEN_KEY = "ser_token";
const USER_KEY = "ser_user";

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload.exp || payload.exp <= Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getInitialAuthState() {
  const storedToken = localStorage.getItem(TOKEN_KEY);

  if (!storedToken) {
    return {
      token: null,
      user: null,
    };
  }

  const payload = decodeToken(storedToken);

  if (!payload) {
    localStorage.removeItem(TOKEN_KEY);

    return {
      token: null,
      user: null,
    };
  }

  return {
    token: storedToken,
    user: payload,
  };
}

function getInitialProfile() {
  try {
    const storedProfile = localStorage.getItem(USER_KEY);

    if (!storedProfile) {
      return null;
    }

    return JSON.parse(storedProfile);
  } catch {
    return null;
  }
}

export default function useAuth() {
  const [{ token, user }, setAuth] = useState(getInitialAuthState);
  const [profile, setProfile] = useState(getInitialProfile);

  const loginWithToken = (tokenData) => {
    const accessToken = tokenData?.access_token;

    if (!accessToken) {
      return;
    }

    const payload = decodeToken(accessToken);

    if (!payload) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setAuth({
        token: null,
        user: null,
      });

      setProfile(null);

      return;
    }

    const profileData = {
      name: tokenData?.name ?? null,
      email: tokenData?.email ?? null,
      picture: tokenData?.picture ?? null,
      user_type: tokenData?.user_type ?? null,
    };

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(profileData)
    );

    setAuth({
      token: accessToken,
      user: payload,
    });

    setProfile(profileData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setAuth({
      token: null,
      user: null,
    });

    setProfile(null);
  };

  return {
    token,
    user,
    profile,
    isLoggedIn: token !== null,
    loginWithToken,
    logout,
  };
}