"use client";

import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  function saveToken(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return { token, saveToken, logout };
}
