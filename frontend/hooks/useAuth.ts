"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // cargar perfil si hay token
  useEffect(() => {
    async function fetchProfile() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Error al cargar perfil", err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  function saveToken(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false); 
    router.push("/login");
  }

  return { token, user, loading, saveToken, logout };
}
